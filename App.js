import React, { Component } from "react";
import { Alert, AppState, BackHandler } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";

import Stack from "./src/menu/stack_menu";
import Session from "./src/util/session";
import WebServiceManager from "./src/util/webservice_manager";
import Constant from "./src/util/constatnt_variables";

//FCM
import messaging from '@react-native-firebase/messaging';
class App extends Component {

  constructor(props) {
    super(props);

    this.state={
      appState: AppState.currentState,
    }
    console.log('session value',Session.getPageInfoItem());
  }

  componentDidMount() {
    this.handleFCMMessage();
    this.goGetApiKeys();
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      }
      if (this.state.appState.match(/active|foreground/) && nextAppState === 'background') {
        console.log('App has go to the background');
      }
      this.setState({ appState: nextAppState });
    });
  }

  componentWillUnmount() {
    this.appStateSubscription.remove();
  }

  handleFCMMessage() {
    // Register background handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('백그라운드 상태에서 메시지가 왔습니다.', remoteMessage);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('앱이 완전히 메모리에서 제거된 상태에서 알림이 왔습니다.', remoteMessage);
        //setInitialRoute(remoteMessage.data.type); // e.g. "Settings
        if (remoteMessage.data.kind == "buy") {
          let pageInfo = { prevPage: "MyPage", nextPage: "BuyList" }
          Session.setPageInfoItem(pageInfo);
        }
        else if (remoteMessage.data.kind == "sell") {
          pageInfo = { prevPage: "MyPage", nextPage: "SalesList" }
          Session.setPageInfoItem(pageInfo);
        }
      }
    });
  }

  //앱에서 필요한 API 키를 서버로부터 가져와 Constant에 저장
  goGetApiKeys() {
    this.callGetApiKeysAPI().then((response) => {
      if(response.success==1) {
        response.keys.forEach(element => {
          if(element.name=="address")
            Constant.addressSearchApiKey=element.key;
          if(element.name=="logis")
            Constant.deliveryApiKey=element.key;
        });
      }
      else {
        Alert.alert('오류','네트워크 오류입니다. 앱을 실행할 수 없습니다.',[
          { text: '확인', onPress: () => { BackHandler.exitApp() } }
        ]);
      }
      console.log("constant address = ",Constant.addressSearchApiKey);
      console.log("constant delivery = ",Constant.deliveryApiKey);
    });
  }

  //서버로부터 API 키를 가져오는 웹서비스
  async callGetApiKeysAPI() {
    let manager = new WebServiceManager(Constant.serviceURL + "/GetApiKeys");
    let response = await manager.start();
    if (response.ok)
        return response.json();
    else
        Promise.reject(response);
  }

  render() {
    return (

      <NavigationContainer>
        <Stack />
      </NavigationContainer>

    );
  }
}

export default App;