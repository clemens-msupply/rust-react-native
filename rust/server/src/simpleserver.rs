use std::sync::{mpsc, Arc, Mutex};
use std::thread;

use actix_web::{dev::Server, middleware, rt, web, App, HttpRequest, HttpServer};
use diesel::{r2d2::ConnectionManager, SqliteConnection};

use crate::dbhandler::{handle_get_values, handle_init_db, handle_post_values};

async fn index(req: HttpRequest) -> &'static str {
    println!("REQ: {:?}", req);
    "Hello world! hey ya"
}

#[derive(Clone)]
pub struct AppData {
    pub db_pool: Option<r2d2::Pool<ConnectionManager<SqliteConnection>>>,
}

fn run_app(tx: mpsc::Sender<Server>, port: u16) -> std::io::Result<()> {
    let mut sys = rt::System::new("test");

    let data = Arc::new(Mutex::new(AppData { db_pool: None }));
    // srv is server controller type, `dev::Server`
    let srv = HttpServer::new(move || {
        App::new()
            .data(data.clone())
            .app_data(web::JsonConfig::default().limit(1024 * 1024 * 50))
            // enable logger
            .wrap(middleware::Logger::default())
            .service(web::resource("/").to(index))
            .service(handle_init_db)
            .service(handle_get_values)
            .service(handle_post_values)
    })
    .bind(format!("127.0.0.1:{}", port))?
    .run();

    // send server controller to main thread
    let _ = tx.send(srv.clone());

    // run future
    sys.block_on(srv)
}

pub fn start_server(port: u16) {
    let (tx, _) = mpsc::channel();

    println!("START SERVER");
    thread::spawn(move || {
        let _ = run_app(tx, port);
    });

    /*
    let srv = rx.recv().unwrap();

      println!("WAITING 10 SECONDS");
      thread::sleep(time::Duration::from_secs(10));

      println!("STOPPING SERVER");
      // init stop server and wait until server gracefully exit
      rt::System::new("").block_on(srv.stop(true));
      */
}

#[cfg(test)]
mod tests {
    use super::start_server;

    use std::thread;
    use std::time;

    #[test]
    fn test_start_server() {
        start_server(8082);

        thread::sleep(time::Duration::from_secs(60 * 1000));
    }
}
