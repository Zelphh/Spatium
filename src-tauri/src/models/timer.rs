use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
// use sqlx::FromRow;

#[derive(Deserialize)]
pub struct CreateTimerPayload {
    pub name: Option<String>,
    pub duration: i64,
    pub description: Option<String>,
    pub mode: String,
    pub category_id: Option<i64>,
}

#[derive(Serialize)]
pub struct CreateTimerResponse {
    pub id: i64,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
pub enum TimerEventType {
    Started,
    Finished,
    Paused,
    Unpaused,
}

impl TimerEventType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Started => "started",
            Self::Finished => "finished",
            Self::Paused => "paused",
            Self::Unpaused => "unpaused",
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct AddTimerEventPayload {
    pub timer_id: i64,
    pub event: TimerEventType,
}

#[derive(Serialize)]
pub struct TimerEventResponse {
    pub id: i64,
}

// Dashboard / history models moved to `models::dashboard`
#[derive(Deserialize, Debug)]
pub struct ChangeCategoryPayload {
    pub session_id: i64,
    pub category_id: i64,
}

#[derive(Deserialize, Debug)]
pub struct ChangeDescriptionPayload {
    pub session_id: i64,
    pub description: String,
}

#[derive(Deserialize, Debug)]
pub struct ChangeNotesPayload {
    pub session_id: i64,
    pub notes: String,
}

#[derive(Serialize, Deserialize, Debug, FromRow)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub color: String,
    pub icon: String,
}
