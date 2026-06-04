use sqlx::SqlitePool;
use chrono::{Datelike, Local, NaiveDate};

use crate::models::dashboard::{ChartData, DashboardDataResponse, SerieData};
use crate::repositories::dashboard::{fetch_dashboard_data, fetch_series_data};

fn get_eixo_x(periodicity: &str) -> Result<Vec<String>, String> {
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
            let hoje = Local::now().date_naive();
            let (ano, mes) = (hoje.year(), hoje.month());

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
) -> Result<ChartData, String> {
    let eixo_x: Vec<String> = get_eixo_x(periodicity.as_str())?;
    let n_buckets = eixo_x.len();
    let series_data: Vec<SerieData> = fetch_series_data(pool, user_id, &periodicity, n_buckets).await?;

    Ok(ChartData {
        label: periodicity,
        categories: eixo_x,
        series: series_data,
    })
}
