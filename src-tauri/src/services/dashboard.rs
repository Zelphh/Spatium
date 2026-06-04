use sqlx::SqlitePool;

use crate::models::dashboard::DashboardDataResponse;
use crate::repositories::dashboard::fetch_dashboard_data;

pub async fn get_dashboard_data_service(pool: &SqlitePool) -> Result<DashboardDataResponse, String> {
    fetch_dashboard_data(pool, 1).await
}
