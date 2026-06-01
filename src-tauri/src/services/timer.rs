use sqlx::SqlitePool;

use crate::models::timer::{
    AddTimerEventPayload,
    ChangeCategoryPayload,
    CreateTimerResponse,
    TimerEventResponse,
};
use crate::repositories::timer::{
    add_total_secs_to_session,
    calc_session_duration_secs,
    change_category,
    insert_timer_event,
    insert_timer_session
};

pub async fn create_timer_service(
    pool: &SqlitePool,
    payload: crate::models::timer::CreateTimerPayload,
) -> Result<CreateTimerResponse, String> {
    let result = insert_timer_session(pool, payload).await?;
    let generated_id = result.last_insert_rowid();

    insert_timer_event(
        pool,
        &AddTimerEventPayload {
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
    let result = insert_timer_event(pool, &payload).await?;

    if payload.event.as_str() == "finished"  {
        let total_secs = 
            calc_session_duration_secs(pool, &payload.timer_id)
            .await
            .expect("Erro ao calculadar a duração da sessão do timer");
        let _ = add_total_secs_to_session(pool, payload.timer_id, total_secs)
            .await
            .expect("Erro ao adicionar tempo do timer");
    }

    Ok(TimerEventResponse {
        id: result.last_insert_rowid(),
    })
}

pub async fn change_timer_category_service(
    pool: &SqlitePool,
    payload: ChangeCategoryPayload,
) -> Result<(), String> {
    println!("Alterando categoria da sessão do timer: {:?}", payload);
    change_category(pool, payload)
        .await
        .expect("Erro ao alterar a categoria da sessão do timer {error}");

    Ok(())
}
