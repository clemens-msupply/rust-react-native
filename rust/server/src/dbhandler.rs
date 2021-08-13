use std::sync::{Arc, Mutex};

use actix_web::{get, post, web, HttpResponse};

use crate::{
    db::{get_values, init_db, post_values},
    models::TestData,
    simpleserver::AppData,
};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct InitBody {
    #[serde(alias = "dbPath")]
    pub db_path: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    message: String,
}

#[post("/initdb")]
pub async fn handle_init_db(
    data: web::Data<Arc<Mutex<AppData>>>,
    body: web::Json<InitBody>,
) -> HttpResponse {
    let pool = init_db(body.db_path.as_str());

    let mut data = data.lock().unwrap();
    data.db_pool = Some(pool);

    HttpResponse::Created().finish()
}

#[get("/values")]
pub async fn handle_get_values(data: web::Data<Arc<Mutex<AppData>>>) -> HttpResponse {
    let data = data.lock().unwrap();
    match &data.db_pool {
        Some(pool) => {
            let connection = pool.get().unwrap();
            let values = get_values(&connection);
            HttpResponse::Ok().json(values)
        }
        None => HttpResponse::BadRequest().json(ErrorResponse {
            message: "DB not initialized".to_string(),
        }),
    }
}

#[post("/values")]
pub async fn handle_post_values(
    data: web::Data<Arc<Mutex<AppData>>>,
    body: web::Json<Vec<TestData>>,
) -> HttpResponse {
    let data = data.lock().unwrap();
    match &data.db_pool {
        Some(pool) => {
            let connection = pool.get().unwrap();
            let values = post_values(&connection, &body);
            HttpResponse::Ok().json(values)
        }
        None => HttpResponse::BadRequest().json(ErrorResponse {
            message: "DB not initialized".to_string(),
        }),
    }
}
