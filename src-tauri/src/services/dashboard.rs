use sqlx::SqlitePool;
use chrono::{Datelike, NaiveDate, Weekday};

use crate::models::dashboard::{ChartData, DashboardDataResponse};
use crate::repositories::dashboard::{fetch_dashboard_data, fetch_series_data};

fn parse_week_to_monday(week_str: &str) -> Result<String, String> {
    let (year_str, week_part) = week_str
        .split_once("-W")
        .ok_or_else(|| "Formato de semana inválido: esperado YYYY-Www".to_string())?;
    let year: i32 = year_str.parse().map_err(|_| "Ano inválido".to_string())?;
    let week: u32 = week_part.parse().map_err(|_| "Número de semana inválido".to_string())?;
    NaiveDate::from_isoywd_opt(year, week, Weekday::Mon)
        .ok_or_else(|| format!("Semana inválida: {week_str}"))
        .map(|d| d.format("%Y-%m-%d").to_string())
}

fn get_eixo_x(periodicity: &str, reference_date: &str) -> Result<Vec<String>, String> {
    match periodicity {
        "day" => Ok((0..24).map(|hour| hour.to_string()).collect()),
        "week" => Ok(vec![
            "Domingo".to_string(),
            "Segunda-feira".to_string(),
            "Terça-feira".to_string(),
            "Quarta-feira".to_string(),
            "Quinta-feira".to_string(),
            "Sexta-feira".to_string(),
            "Sábado".to_string(),
        ]),
        "month" => {
            let (year_str, month_str) = reference_date
                .split_once('-')
                .ok_or_else(|| "Formato de mês inválido: esperado YYYY-MM".to_string())?;
            let ano: i32 = year_str.parse().map_err(|_| "Ano inválido".to_string())?;
            let mes: u32 = month_str.parse().map_err(|_| "Mês inválido".to_string())?;

            let ultimo_dia = if mes == 12 {
                NaiveDate::from_ymd_opt(ano + 1, 1, 1).unwrap()
            } else {
                NaiveDate::from_ymd_opt(ano, mes + 1, 1).unwrap()
            }
            .pred_opt()
            .unwrap()
            .day() as i32;

            Ok((1..=ultimo_dia).map(|day| day.to_string()).collect())
        }
        _ => Err("Periodicidade não suportada".to_string()),
    }
}

pub async fn get_dashboard_data_service(pool: &SqlitePool) -> Result<DashboardDataResponse, String> {
    fetch_dashboard_data(pool, 1).await
}

pub async fn get_dashboard_chart(
    pool: &SqlitePool,
    user_id: i64,
    periodicity: String,
    date: String,
) -> Result<ChartData, String> {
    let reference_date = match periodicity.as_str() {
        "week" => parse_week_to_monday(&date)?,
        _ => date,
    };

    let eixo_x = get_eixo_x(periodicity.as_str(), &reference_date)?;
    let n_buckets = eixo_x.len();
    let series_data = fetch_series_data(pool, user_id, &periodicity, n_buckets, &reference_date).await?;

    Ok(ChartData {
        label: periodicity,
        categories: eixo_x,
        series: series_data,
    })
}
