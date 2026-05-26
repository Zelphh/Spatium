use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct CreateTimerPayload {
    pub name: Option<String>,
    pub duration: i64,
    pub description: Option<String>,
    pub mode: String,
}

#[derive(Serialize)]
pub struct CreateTimerResponse {
    pub id: i64,
}

#[derive(Deserialize)]
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

#[derive(Deserialize)]
pub struct AddTimerEventPayload {
    pub timer_id: i64,
    pub event: TimerEventType,
}

#[derive(Serialize)]
pub struct TimerEventResponse {
    pub id: i64,
}