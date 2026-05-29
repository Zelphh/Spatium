use sqlx::SqlitePool;

use crate::models::timer::HistoryDataResponse;
use crate::repositories::history::fetch_history_data;

pub async fn get_history_data_service(pool: &SqlitePool) -> Result<HistoryDataResponse, String> {
    fetch_history_data(pool, 1).await
}
