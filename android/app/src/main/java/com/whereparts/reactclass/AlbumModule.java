package com.whereparts.reactclass;

import android.net.Uri;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.whereparts.util.MediaUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;

public class AlbumModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;

    public AlbumModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext=reactContext;
    }

    @Override
    public String getName() {
        return "AlbumModule";
    }

    @ReactMethod
    public void getAlbumUris(Callback failedCallback, Callback successCallback) {
        try{
            MediaUtil media = new MediaUtil(reactContext);
            ArrayList<Uri> images = media.getImageContentUris();
            WritableArray imageURIs = Arguments.createArray();
            for(Uri uri : images)
                imageURIs.pushString(uri.toString());
            successCallback.invoke(imageURIs);
        }catch(Exception e) {
            failedCallback.invoke("error");
        }
    }

    @ReactMethod
    public void getAlbumUrisGroup(Callback failedCallback, Callback successCallback) {
        try{
            MediaUtil media = new MediaUtil(reactContext);
            HashMap<String,ArrayList<String>> sourceMap = media.getImageContentUrisGroup();
            Set<String> keys = sourceMap.keySet();
            WritableMap imageMap = Arguments.createMap();
            for(String key : keys) {
                WritableArray uris = Arguments.fromList(sourceMap.get(key));
                imageMap.putArray(key,uris);
            }
            successCallback.invoke(imageMap);
        }catch(Exception e) {
            failedCallback.invoke("error");
        }
    }
}
