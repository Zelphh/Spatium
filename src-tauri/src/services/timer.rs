use sqlx::SqlitePool;

use crate::models::timer::{
    ActiveTimerSession, AddTimerEventPayload, Category, ChangeCategoryPayload, ChangeDescriptionPayload, ChangeNotesPayload, CreateCategoryPayload, UpdateCategoryPayload, CreateTimerResponse, TimerEventResponse
};
use crate::repositories::timer::{
    add_total_secs_to_session, calc_session_duration_secs, change_category, change_description, change_notes, delete_category, get_active_session_id, get_categories, get_last_event, get_session_summary, insert_category, update_category, insert_timer_event, insert_timer_session
};

pub async fn get_active_session_id_service(pool: &SqlitePool, user_id: i64) -> Result<Option<i64>, String> {
    get_active_session_id(pool, user_id).await
}

pub async fn get_active_timer_session_service(
    pool: &SqlitePool,
    user_id: i64,
) -> Result<Option<ActiveTimerSession>, String> {
    let Some(session_id) = get_active_session_id(pool, user_id).await? else {
        return Ok(None);
    };

    let (mode, category_id, description, duration_secs) = get_session_summary(pool, session_id).await?;
    let last_event = get_last_event(pool, session_id)
        .await?
        .unwrap_or_else(|| "started".to_string());
    let elapsed_secs = calc_session_duration_secs(pool, &session_id).await?;

    Ok(Some(ActiveTimerSession {
        session_id,
        mode,
        elapsed_secs,
        is_paused: last_event == "paused",
        category_id,
        description,
        duration_secs,
    }))
}

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

    if payload.event.as_str() == "finished" {
        let total_secs = calc_session_duration_secs(pool, &payload.timer_id).await?;
        add_total_secs_to_session(pool, payload.timer_id, total_secs).await?;
    }

    Ok(TimerEventResponse {
        id: result.last_insert_rowid(),
    })
}

pub async fn change_timer_category_service(
    pool: &SqlitePool,
    payload: ChangeCategoryPayload,
) -> Result<(), String> {
    change_category(pool, payload)
        .await
        .expect("Erro ao alterar a categoria da sessão do timer {error}");

    Ok(())
}

pub async fn change_timer_description_service(
    pool: &SqlitePool,
    payload: ChangeDescriptionPayload,
) -> Result<(), String> {
    change_description(pool, payload)
        .await
        .expect("Erro ao alterar a descrição da sessão do timer {error}");

    Ok(())
}

pub async fn change_timer_notes_service(
    pool: &SqlitePool,
    payload: ChangeNotesPayload,
) -> Result<(), String> {
    change_notes(pool, payload)
        .await
        .expect("Erro ao alterar as notas da sessão do timer {error}");

    Ok(())
}

pub async fn get_categories_service(pool: &SqlitePool) -> Result<Vec<Category>, String> {
    get_categories(pool).await
}

pub async fn create_category_service(
    pool: &SqlitePool,
    payload: CreateCategoryPayload,
) -> Result<Category, String> {
    let id = insert_category(pool, payload.name.clone(), payload.color.clone(), payload.icon.clone()).await?;

    Ok(Category {
        id,
        name: payload.name,
        color: payload.color,
        icon: payload.icon,
    })
}

pub async fn update_category_service(
    pool: &SqlitePool,
    payload: UpdateCategoryPayload,
) -> Result<Category, String> {
    update_category(pool, payload.id, payload.name.clone(), payload.color.clone(), payload.icon.clone()).await?;

    Ok(Category {
        id: payload.id,
        name: payload.name,
        color: payload.color,
        icon: payload.icon,
    })
}

pub async fn delete_category_service(pool: &SqlitePool, id: i64) -> Result<(), String> {
    delete_category(pool, id).await
}
