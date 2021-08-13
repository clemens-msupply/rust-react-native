#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_migrations;

extern crate libc;

mod db;
mod dbhandler;
mod models;
mod schema;
mod simpleserver;

diesel_migrations::embed_migrations!("./migrations/sqlite");

#[cfg(feature = "jni")]
#[allow(non_snake_case)]
pub mod android {
    extern crate jni;

    use jni::sys::jchar;

    use crate::simpleserver::start_server;

    use self::jni::objects::{JClass, JString};
    use self::jni::sys::{jshort, jstring};
    use self::jni::JNIEnv;

    #[no_mangle]
    pub unsafe extern "C" fn Java_com_rustreacttest_MobileAppBridge_rustHelloWorld(
        env: JNIEnv,
        _: JClass,
        name: JString,
    ) -> jstring {
        let name: String = env.get_string(name).unwrap().into();
        let response = format!("Hello {}!", name);
        env.new_string(response).unwrap().into_inner()
    }

    #[no_mangle]
    pub unsafe extern "C" fn Java_com_rustreacttest_MobileAppBridge_rustStartServer(
        _: JNIEnv,
        _: JClass,
        port: jchar,
    ) -> jshort {
        start_server(port);
        0
    }
}
