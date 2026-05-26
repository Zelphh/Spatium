use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct CreateTimerPayload {
    pub name: Option<String>,
    pub duration: i64,
    pub description: Option<String>,
}

#[derive(Serialize)]
pub struct CreateTimerResponse {
    pub id: i64,
}