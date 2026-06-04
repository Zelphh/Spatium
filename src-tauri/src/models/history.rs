use serde::Serialize;

use crate::models::dashboard::SessionListItem;

#[derive(Serialize)]
pub struct HistoryDataResponse {
    pub total_secs: i64,
    pub sessions: Vec<SessionListItem
    >,
}