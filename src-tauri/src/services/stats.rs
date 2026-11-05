use std::collections::{BTreeSet, HashMap};

use chrono::{DateTime, Datelike, Duration, Local, Months, NaiveDate, NaiveDateTime, Timelike, Weekday};
use sqlx::SqlitePool;

use crate::models::stats::{CategoryStat, DurationDistribution, StatsData, StatsSessionRow};
use crate::repositories::stats::fetch_finished_sessions;

/// Quantidade de pontos no gráfico de evolução por categoria.
const EVOLUTION_POINTS: usize = 8;

const WEEKDAYS_PT: [&str; 7] = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MONTHS_PT: [&str; 12] = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

#[derive(Clone, Copy, PartialEq)]
enum Period {
    Day,
    Week,
    Month,
}

/// Intervalo de datas locais [start, end).
#[derive(Clone, Copy)]
struct Range {
    start: NaiveDate,
    end: NaiveDate,
}

impl Range {
    fn contains(&self, d: NaiveDate) -> bool {
        d >= self.start && d < self.end
    }

    fn days(&self) -> i64 {
        (self.end - self.start).num_days()
    }
}

struct Session {
    category: String,
    color: String,
    secs: i64,
    local: NaiveDateTime,
}

fn parse_local(ts: &str) -> Option<NaiveDateTime> {
    if let Ok(dt) = DateTime::parse_from_rfc3339(ts) {
        return Some(dt.with_timezone(&Local).naive_local());
    }
    // Fallback para o formato `datetime('now')` do SQLite (UTC sem fuso).
    NaiveDateTime::parse_from_str(ts, "%Y-%m-%d %H:%M:%S")
        .ok()
        .map(|naive| naive.and_utc().with_timezone(&Local).naive_local())
}

fn parse_period(periodicity: &str) -> Result<Period, String> {
    match periodicity {
        "day" => Ok(Period::Day),
        "week" => Ok(Period::Week),
        "month" => Ok(Period::Month),
        _ => Err("Periodicidade não suportada".to_string()),
    }
}

/// Converte a data de referência enviada pelo front (YYYY-MM-DD, YYYY-Www ou YYYY-MM)
/// no primeiro dia do período.
fn period_start(period: Period, date: &str) -> Result<NaiveDate, String> {
    match period {
        Period::Day => NaiveDate::parse_from_str(date, "%Y-%m-%d").map_err(|_| format!("Data inválida: {date}")),
        Period::Week => {
            let (year, week) = date
                .split_once("-W")
                .ok_or_else(|| "Formato de semana inválido: esperado YYYY-Www".to_string())?;
            let year: i32 = year.parse().map_err(|_| "Ano inválido".to_string())?;
            let week: u32 = week.parse().map_err(|_| "Número de semana inválido".to_string())?;
            NaiveDate::from_isoywd_opt(year, week, Weekday::Mon).ok_or_else(|| format!("Semana inválida: {date}"))
        }
        Period::Month => NaiveDate::parse_from_str(&format!("{date}-01"), "%Y-%m-%d")
            .map_err(|_| format!("Mês inválido: {date}")),
    }
}

/// Período deslocado `offset` unidades a partir de `start` (negativo = passado).
fn shifted(period: Period, start: NaiveDate, offset: i64) -> Range {
    match period {
        Period::Day => {
            let s = start + Duration::days(offset);
            Range { start: s, end: s + Duration::days(1) }
        }
        Period::Week => {
            let s = start + Duration::weeks(offset);
            Range { start: s, end: s + Duration::weeks(1) }
        }
        Period::Month => {
            let s = if offset >= 0 {
                start + Months::new(offset as u32)
            } else {
                start - Months::new((-offset) as u32)
            };
            Range { start: s, end: s + Months::new(1) }
        }
    }
}

fn evolution_label(period: Period, range: Range) -> String {
    match period {
        Period::Day | Period::Week => range.start.format("%d/%m").to_string(),
        Period::Month => MONTHS_PT[range.start.month0() as usize].to_string(),
    }
}

/// Dias consecutivos com foco terminando hoje (ou ontem, se hoje ainda não teve sessão).
fn current_streak(days: &BTreeSet<NaiveDate>, today: NaiveDate) -> i64 {
    let mut cursor = if days.contains(&today) { today } else { today - Duration::days(1) };
    let mut streak = 0;
    while days.contains(&cursor) {
        streak += 1;
        cursor -= Duration::days(1);
    }
    streak
}

fn best_of_period(period: Period, sessions: &[&Session]) -> (String, Option<String>) {
    match period {
        Period::Day => {
            let mut by_hour = [0i64; 24];
            for s in sessions {
                by_hour[s.local.hour() as usize] += s.secs;
            }
            let best = (0..24).filter(|&h| by_hour[h] > 0).max_by_key(|&h| (by_hour[h], std::cmp::Reverse(h)));
            ("Melhor horário".to_string(), best.map(|h| format!("{h}h–{}h", (h + 1) % 24)))
        }
        Period::Week => {
            let mut by_day = [0i64; 7];
            for s in sessions {
                by_day[s.local.weekday().num_days_from_monday() as usize] += s.secs;
            }
            let best = (0..7).filter(|&d| by_day[d] > 0).max_by_key(|&d| (by_day[d], std::cmp::Reverse(d)));
            ("Melhor dia".to_string(), best.map(|d| WEEKDAYS_PT[d].to_string()))
        }
        Period::Month => {
            let mut by_date: HashMap<NaiveDate, i64> = HashMap::new();
            for s in sessions {
                *by_date.entry(s.local.date()).or_default() += s.secs;
            }
            let best = by_date
                .into_iter()
                .max_by_key(|&(d, secs)| (secs, std::cmp::Reverse(d)))
                .map(|(d, _)| d.format("%d/%m").to_string());
            ("Melhor dia".to_string(), best)
        }
    }
}

pub async fn get_stats_data(
    pool: &SqlitePool,
    user_id: i64,
    periodicity: String,
    date: String,
) -> Result<StatsData, String> {
    let period = parse_period(&periodicity)?;
    let start = period_start(period, &date)?;
    let rows: Vec<StatsSessionRow> = fetch_finished_sessions(pool, user_id).await?;

    let sessions: Vec<Session> = rows
        .into_iter()
        .filter_map(|r| {
            parse_local(&r.created_at).map(|local| Session {
                category: r.category,
                color: r.color,
                secs: r.duration_secs.max(0),
                local,
            })
        })
        .collect();

    let current = shifted(period, start, 0);
    let previous = shifted(period, start, -1);
    let evolution_ranges: Vec<Range> = (0..EVOLUTION_POINTS as i64)
        .map(|i| shifted(period, start, i - (EVOLUTION_POINTS as i64 - 1)))
        .collect();

    // Mapa de calor: o próprio mês, ou as últimas 4 semanas até o fim do período.
    let heat_range = match period {
        Period::Month => current,
        _ => Range { start: current.end - Duration::weeks(4), end: current.end },
    };

    let in_current: Vec<&Session> = sessions.iter().filter(|s| current.contains(s.local.date())).collect();

    let total_secs: i64 = in_current.iter().map(|s| s.secs).sum();
    let prev_total_secs: i64 = sessions
        .iter()
        .filter(|s| previous.contains(s.local.date()))
        .map(|s| s.secs)
        .sum();
    let session_count = in_current.len() as i64;
    let avg_secs = if session_count > 0 { total_secs / session_count } else { 0 };
    let longest_secs = in_current.iter().map(|s| s.secs).max().unwrap_or(0);

    let mut distribution = DurationDistribution { short: 0, medium: 0, long: 0 };
    for s in &in_current {
        match s.secs {
            x if x < 25 * 60 => distribution.short += 1,
            x if x <= 60 * 60 => distribution.medium += 1,
            _ => distribution.long += 1,
        }
    }

    let (best_label, best_value) = best_of_period(period, &in_current);

    let mut heatmap = vec![vec![0i64; 24]; 7];
    for s in sessions.iter().filter(|s| heat_range.contains(s.local.date())) {
        heatmap[s.local.weekday().num_days_from_monday() as usize][s.local.hour() as usize] += s.secs;
    }

    let focus_days: BTreeSet<NaiveDate> = sessions.iter().filter(|s| s.secs > 0).map(|s| s.local.date()).collect();
    let streak_days = current_streak(&focus_days, Local::now().date_naive());

    // Categorias com algum tempo dentro da janela de evolução (inclui atual e anterior).
    let mut by_category: HashMap<String, CategoryStat> = HashMap::new();
    for s in &sessions {
        let date = s.local.date();
        let Some(idx) = evolution_ranges.iter().position(|r| r.contains(date)) else {
            continue;
        };
        let entry = by_category.entry(s.category.clone()).or_insert_with(|| CategoryStat {
            name: s.category.clone(),
            color: s.color.clone(),
            total_secs: 0,
            prev_total_secs: 0,
            evolution: vec![0; EVOLUTION_POINTS],
        });
        entry.evolution[idx] += s.secs;
        if current.contains(date) {
            entry.total_secs += s.secs;
        } else if previous.contains(date) {
            entry.prev_total_secs += s.secs;
        }
    }

    let mut categories: Vec<CategoryStat> = by_category.into_values().collect();
    categories.sort_by(|a, b| {
        b.total_secs
            .cmp(&a.total_secs)
            .then(b.prev_total_secs.cmp(&a.prev_total_secs))
            .then(a.name.cmp(&b.name))
    });

    Ok(StatsData {
        total_secs,
        prev_total_secs,
        session_count,
        avg_secs,
        longest_secs,
        best_label,
        best_value,
        streak_days,
        period_days: current.days(),
        categories,
        evolution_labels: evolution_ranges.iter().map(|r| evolution_label(period, *r)).collect(),
        distribution,
        heatmap,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn d(s: &str) -> NaiveDate {
        NaiveDate::parse_from_str(s, "%Y-%m-%d").unwrap()
    }

    #[test]
    fn parses_period_starts() {
        assert_eq!(period_start(Period::Week, "2026-W45").unwrap(), d("2026-11-02"));
        assert_eq!(period_start(Period::Month, "2026-11").unwrap(), d("2026-11-01"));
        assert_eq!(period_start(Period::Day, "2026-11-04").unwrap(), d("2026-11-04"));
    }

    #[test]
    fn shifts_months_across_years() {
        let r = shifted(Period::Month, d("2026-01-01"), -1);
        assert_eq!(r.start, d("2025-12-01"));
        assert_eq!(r.end, d("2026-01-01"));
        assert_eq!(shifted(Period::Month, d("2026-02-01"), 0).days(), 28);
    }

    #[test]
    fn streak_counts_from_yesterday_when_today_empty() {
        let days: BTreeSet<NaiveDate> = [d("2026-11-01"), d("2026-11-02"), d("2026-11-03")].into_iter().collect();
        assert_eq!(current_streak(&days, d("2026-11-04")), 3);
        assert_eq!(current_streak(&days, d("2026-11-03")), 3);
        assert_eq!(current_streak(&days, d("2026-11-06")), 0);
    }
}
