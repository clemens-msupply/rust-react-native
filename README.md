# Setup

[Also see](https://medium.com/@marekkotewicz/building-a-mobile-app-in-rust-and-react-native-part-1-project-setup-b8dbcf3f539f)

## Android

From the Android SDK install (Android Studio)

- SDK
- NDK
- CMAKE

### Bash ENV:

Make sure you have all Android related env set.

For example, in .bash_profile:

```
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
export NDK_HOME=$ANDROID_HOME/ndk/{path to version}/
```

### Build NDK Cross Compiler Tool Chains

In the project root dir:

> mkdir NDK
> ${NDK_HOME}/build/tools/make_standalone_toolchain.py --api 26 --arch arm64 --install-dir NDK/arm64
> ${NDK_HOME}/build/tools/make_standalone_toolchain.py --api 26 --arch arm --install-dir NDK/arm
> ${NDK_HOME}/build/tools/make_standalone_toolchain.py --api 26 --arch x86 --install-dir NDK/x86

[also see](https://mozilla.github.io/firefox-browser-architecture/experiments/2017-09-21-rust-on-android.html)
