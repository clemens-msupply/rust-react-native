extern crate diesel;

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
        diesel::insert_into(testdata)
            .values(&(id.eq(1), value.eq("test")))
            .execute(&connection)
            .unwrap();
        diesel::insert_into(testdata)
            .values(&(id.eq(2), value.eq("test2")))
            .execute(&connection)
            .unwrap();
    */
    pool
}

pub fn get_values(connection: &SqliteConnection) -> Vec<TestData> {
    use super::schema::testdata::dsl::*;
    let values = testdata.load::<TestData>(connection).unwrap();
    return values;
}

pub fn post_values(connection: &SqliteConnection, data: &Vec<TestData>) {
    use super::schema::testdata::dsl::*;
    diesel::insert_into(testdata)
        .values(data)
        .execute(connection)
        .unwrap();
}

#[cfg(test)]
mod tests {
    use super::init_db;

    #[test]
    fn test_init_db() {
        init_db("./test-db.sqlite");
    }
}
