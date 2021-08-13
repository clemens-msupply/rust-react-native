#! /bin/bash

LIB_NAME=libserver

mkdir -p ../../android/app/src/main/jniLibs
mkdir -p ../../android/app/src/main/jniLibs/x86
mkdir -p ../../android/app/src/main/jniLibs/arm64-v8a
mkdir -p ../../android/app/src/main/jniLibs/armeabi-v7a
cp ./target/i686-linux-android/release/$LIB_NAME.so ../../android/app/src/main/jniLibs/x86/$LIB_NAME.so
cp ./target/aarch64-linux-android/release/$LIB_NAME.so ../../android/app/src/main/jniLibs/arm64-v8a/$LIB_NAME.so
cp ./target/armv7-linux-androideabi/release/$LIB_NAME.so ../../android/app/src/main/jniLibs/armeabi-v7a/$LIB_NAME.so
