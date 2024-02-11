import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Image, BackHandler, StyleSheet, Modal } from 'react-native';
import { template, colors } from "../styles/template/page_style";
import { styles } from "../styles/mypage";
import AsyncStorage from "@react-native-async-storage/async-storage";

import IconMark from 'react-native-vector-icons/AntDesign';
import Session from '../util/session';
import FunctionUtil from '../util/libraries_function';
//import { colors } from 'react-native-swiper-flatlist/src/themes';


class MyPage extends Component {
  constructor(props) {
    super(props);
    this.idRef = React.createRef();
    this.passwordRef = React.createRef();
    this.state = {
      modalVisible: false
    }
  }


  goSalesListScreen = () => {
    this.props.navigation.navigate('SalesList')
  }
  goBuyListScreen = () => {
    this.props.navigation.navigate('BuyList')
  }
  goPickListScreen = () => {
    this.props.navigation.navigate('PickList')
  }
  goEditProfileScreen = () => {
    this.props.navigation.navigate('EditProfile');
  }

  /* goExitApp = () => {
     Alert.alert(
       '주의',
       '로그아웃하고 앱을 종료합니다.',
       [
         { text: '취소', onPress: () => { } },
         { text: '확인', onPress: () => { this.logout() } },
       ],
       { cancelable: false });
     return true;
   }*/

  render() {
    const { companyName, companyAddress, companyNo } = Session.getUserInfoItem();
    const displayCompanyNo = companyNo.slice(0, 3) + "-" + companyNo.slice(3, 5) + "-" + companyNo.slice(5, 10);
    return (
      <View style={inStyle.baseContainer} >

        {
          this.state.modalVisible && <GoExitApp hideButtonClicked={() => this.setState({ modalVisible: false })} />
        }
        {/*내정보 */}
        <View style={styles.viewHeaderLayout}>

          {/*로그아웃 */}
          <View style={styles.container}>

            <TouchableOpacity style={{ alignItems: 'flex-end' }} activeOpacity={0.8} onPress={() => { this.setState({ modalVisible: true }) }/*this.goExitApp*/}>
              <Text style={{ color: colors.white }}>로그아웃</Text>
            </TouchableOpacity>
            <View style={[styles.center, { margin: 30 }]}>
              <Text style={styles.name_text}>{companyName}</Text>
              <Text style={[inStyle.content_text, styles.container]}>{displayCompanyNo}</Text>
              <Text style={inStyle.content_text}>{companyAddress}</Text>
            </View>

          </View>
        </View>

        {/*설정 */}
        <View style={[styles.container]}>

          <View style={styles.item2}>
            <TouchableOpacity style={inStyle.btn_top} activeOpacity={0.8} onPress={this.goEditProfileScreen}>
              <Image
                source={
                  require('../images/icon/mypage/myinfo.png')
                }
              />
              <Text style={styles.btn_text}>내 정보 수정</Text>
            </TouchableOpacity>

            <TouchableOpacity style={inStyle.btn_top} activeOpacity={0.8}>
              <Image
                source={
                  require('../images/icon/mypage/point.png')
                }
              />
              <Text style={styles.btn_text}>탄소 포인트</Text>
            </TouchableOpacity>

            <TouchableOpacity style={inStyle.btn_top} activeOpacity={0.8}>
              <Image
                source={
                  require('../images/icon/mypage/card.png')
                }
              />
              <Text style={[styles.btn_text, { marginTop: 15 }]}>결제 정보</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.container}>
            <TouchableOpacity style={inStyle.btn_bottom} onPress={this.goSalesListScreen}>
              <Image
                style={styles.container}
                source={
                  require('../images/icon/mypage/sale.png')
                }
              /><Text style={styles.sub_text}>판매 내역</Text>

            </TouchableOpacity>

            <TouchableOpacity style={[inStyle.btn_bottom, { marginTop: 15, marginBottom: 15 }]} onPress={this.goBuyListScreen}>
              <Image
                style={styles.container}
                source={
                  require('../images/icon/mypage/shopping-bag.png')
                }
              /><Text style={styles.sub_text}>구매 내역</Text>

            </TouchableOpacity>

            <TouchableOpacity style={inStyle.btn_bottom} onPress={this.goPickListScreen}>
              <Image
                style={styles.container}
                source={
                  require('../images/icon/mypage/heart.png')
                }
              /><Text style={styles.sub_text}>관심 목록</Text>

            </TouchableOpacity>
          </View>


        </View>
      </View>
    );
  }

}

class GoExitApp extends Component {
  constructor(props) {
    super(props);
  }
  //현재 설정된 로그인관련 정보를 가져와 AsyncStorage에 저장하고 앱 종료
  logout() {
    FunctionUtil.getLoginType().then((loginInfo) => {
      Session.clear();
      //console.log('로그아웃 후 AsyncStorage에 저장할 값 = ', response);
      //console.log('로그아웃 후 Session에 저장된 값 = ',Session.getAllItem());
      //userInfo를 암호화하여 AsyncStorage에 저장
      AsyncStorage.setItem('userInfo', FunctionUtil.encrypt(loginInfo));
      BackHandler.exitApp();
    });
  }

  goExitApp = (state) => {
    if (state === true) {
      this.logout();
      return true;
    }
    else {
      this.props.hideButtonClicked();
      return false;
    }

  }
  render() {
    return (
      <Modal transparent={true} >
        <View style={[inStyle.modal]}>
          <View style={{ width: '50%' }}>
            <View style={inStyle.modal1}>
              <Text style={styles.name_text}>로그아웃</Text>
              <Text style={inStyle.content_text_modal}>앱을 종료합니다.</Text>
            </View>

            <View style={styles.item2}>
              <TouchableOpacity style={inStyle.modal2} onPress={() => { this.goExitApp(true) }}>
                <IconMark name={"check"} size={20} color={colors.white} />
              </TouchableOpacity>

              <TouchableOpacity style={inStyle.modal3} onPress={() => { this.goExitApp(false) }}>
                <IconMark name={"close"} size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>


      </Modal>

    )
  }
}
export default MyPage;

const inStyle = StyleSheet.create({
  baseContainer: [template.baseContainer, { backgroundColor: colors.light }],
  name_text: [styles.name_text, { color: colors.white }],
  content_text: [template.contentText, { color: colors.white }],
  btn_top: [styles.btn, styles.center, { width: 90, height: 90 }],
  btn_bottom: [styles.btn, styles.center, { height: 60, flexDirection: 'row', justifyContent: 'flex-start', padding: 15 }],
  modal: [styles.modal_background, styles.center],
  modal1: [styles.modal1, styles.center],
  modal2: [styles.modal2, styles.center, { borderBottomLeftRadius: 20 }],
  modal3: [styles.modal3, styles.center, { borderBottomRightRadius: 20 }],
  content_text_modal: [styles.container, template.contentText]
}); 