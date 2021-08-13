use super::schema::testdata;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "testdata"]
pub struct TestData {
    pub id: i32,
    pub value: String,
}
