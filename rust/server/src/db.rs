extern crate diesel;

use std::time::Instant;

use diesel::prelude::*;
use diesel::r2d2::ConnectionManager;
use r2d2::Pool;

use crate::models::TestData;

embed_migrations!("./migrations/sqlite");

pub fn init_db(db_path: &str) -> Pool<ConnectionManager<SqliteConnection>> {
    let manager = ConnectionManager::<SqliteConnection>::new(db_path);
    let pool = r2d2::Pool::new(manager).unwrap();

    let connection = pool.get().unwrap();
    let err = embedded_migrations::run_with_output(&connection, &mut std::io::stdout());
    match err {
        Ok(_) => println!("Migration done"),
        Err(err) => println!("error: {}", err),
    };

    use super::schema::testdata::dsl::*;

    diesel::delete(testdata).execute(&connection).unwrap();

    /*
    use rand::distributions::Alphanumeric;
    use rand::{thread_rng, Rng};


    let mut data: Vec<TestData> = Vec::new();
    for n in 0..1_000 {
        let rand_string: String = thread_rng()
            .sample_iter(&Alphanumeric)
            .take(10000)
            .map(char::from)
            .collect();
        data.push(TestData {
            id: n,
            value: rand_string,
        });
    }
    post_values(&connection, &data).unwrap();
    */
    pool
}

pub fn get_values(connection: &SqliteConnection) -> QueryResult<Vec<TestData>> {
    let now = Instant::now();
    use super::schema::testdata::dsl::*;
    let values = testdata.load::<TestData>(connection);

    println!("#Get {}ms", now.elapsed().as_millis());
    return values;
}

pub fn post_values(connection: &SqliteConnection, data: &Vec<TestData>) -> QueryResult<usize> {
    let now = Instant::now();

    use super::schema::testdata::dsl::*;
    let result = diesel::insert_into(testdata)
        .values(data)
        .execute(connection);

    println!("#Post {}ms", now.elapsed().as_millis());
    return result;
}

#[cfg(test)]
mod tests {
    use super::init_db;

    #[test]
    fn test_init_db() {
        init_db("./test-db.sqlite");
    }
}
