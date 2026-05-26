use sqlx::SqlitePool;

use crate::models::timer::{
    AddTimerEventPayload,
    CreateTimerResponse,
    TimerEventResponse,
};
use crate::repositories::timer::{insert_timer_event, insert_timer_session};

pub async fn create_timer_service(
    pool: &SqlitePool,
    payload: crate::models::timer::CreateTimerPayload,
) -> Result<CreateTimerResponse, String> {
    let result = insert_timer_session(pool, payload).await?;
    let generated_id = result.last_insert_rowid();

    insert_timer_event(
        pool,
        AddTimerEventPayload {
            timer_id: generated_id,
            event: crate::models::timer::TimerEventType::Started,
        },
    )
    .await?;

    Ok(CreateTimerResponse {
        id: generated_id,
    })
}

pub async fn add_event_timer_service(
    pool: &SqlitePool,
    payload: AddTimerEventPayload,
) -> Result<TimerEventResponse, String> {
    let result = insert_timer_event(pool, payload).await?;

    Ok(TimerEventResponse {
        id: result.last_insert_rowid(),
    })
}