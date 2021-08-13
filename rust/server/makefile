ARCHS_IOS = i386-apple-ios x86_64-apple-ios armv7-apple-ios armv7s-apple-ios aarch64-apple-ios
ARCHS_ANDROID = aarch64-linux-android armv7-linux-androideabi i686-linux-android
LIB=libsigner.a
PWD=`pwd`

CC_aarch64-linux-android="$(PWD)/../../NDK/arm64/bin/aarch64-linux-android-clang"
AR_aarch64-linux-android="$(PWD)/../../NDK/arm64/bin/aarch64-linux-android-ar"

CC_armv7-linux-androideabi="$(PWD)/../../NDK/arm/bin/arm-linux-androideabi-clang"
AR_armv7-linux-androideabi="$(PWD)/../../NDK/arm/bin/arm-linux-androideabi-ar"

CC_i686-linux-android="$(PWD)/../../NDK/x86/bin/i686-linux-android-clang"
AR_i686-linux-android="$(PWD)/../../NDK/x86/bin/i686-linux-android-ar"

all: ios android

ios: $(LIB)

android: $(ARCHS_ANDROID)
	sh copy_android.sh

.PHONY: $(ARCHS_IOS)
$(ARCHS_IOS): %:
	cargo build --target $@ --release

.PHONY: $(ARCHS_ANDROID)
$(ARCHS_ANDROID): %:
	CC="$(CC_$@)" AR="$(AR_$@)" cargo build --target $@ --release

$(LIB): $(ARCHS_IOS)
	lipo -create -output $@ $(foreach arch,$(ARCHS_IOS),$(wildcard target/$(arch)/release/$(LIB)))