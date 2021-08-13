package com.rustreacttest;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.content.Context;

/**
 * Created by marek on 17/08/2017.
 */

public class MobileAppBridge extends ReactContextBaseJavaModule {
    private Context context;

    static {
        System.loadLibrary("server");
    }

    @Override
    public String getName() {
        return "MobileAppBridge";
    }

    public MobileAppBridge(ReactApplicationContext reactContext) {
        super(reactContext);

        this.context = reactContext;
    }

    @ReactMethod
    public void sayHelloWorld(String name, Promise promise) {
        promise.resolve(rustHelloWorld(name));
    }

    @ReactMethod
    public void startServer(int port, Promise promise) {
        promise.resolve(rustStartServer(port));
    }

    @ReactMethod
    public void getDBDir(Promise promise) {
        String path = context.getFilesDir().getAbsolutePath();
        promise.resolve(path);
    }

    private static native String rustHelloWorld(String seed);

    private static native int rustStartServer(int port);
}
