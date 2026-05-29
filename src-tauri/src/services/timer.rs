use sqlx::SqlitePool;

use crate::models::timer::{
    AddTimerEventPayload,
    CreateTimerResponse,
    DashboardDataResponse,
    HistoryDataResponse,
    TimerEventResponse,
};
use crate::repositories::timer::{
    fetch_dashboard_data,
    fetch_history_data,
    insert_timer_event,
    insert_timer_session,
};

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

pub async fn get_dashboard_data_service(pool: &SqlitePool) -> Result<DashboardDataResponse, String> {
    fetch_dashboard_data(pool, 1).await
}

pub async fn get_history_data_service(pool: &SqlitePool) -> Result<HistoryDataResponse, String> {
    fetch_history_data(pool, 1).await
}