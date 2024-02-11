import React, { Component, PureComponent } from 'react';
import {
    ScrollView, Pressable, TextInput, View, Text, StyleSheet, Dimensions,
    Image, FlatList, TouchableOpacity, Modal, Animated, BackHandler, Alert, NativeModules, SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Indicator from '../../util/indicator';
import Constant from "../../util/constatnt_variables";
import Session from '../../util/session';
import WebServiceManager from "../../util/webservice_manager";
import EmptyListView from '../../util/empty_list_view';

import CarIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import Icon from 'react-native-vector-icons/MaterialIcons';
import CameraIcon from 'react-native-vector-icons/SimpleLineIcons';
import ListItem from './item';
import { template, colors } from '../../styles/template/page_style';
//import { template } from '@babel/core';

class Home extends Component {
    constructor(props) {
        super(props);
        this.contents = [];  //최초 가져온 상품 리스트
        this.AnimatedHeaderValue = new Animated.Value(0);
        this.userID = Session.getUserID();

        //안드로이드에서 정의한 모듈 가져옴
        const { ImageModule } = NativeModules;
        this.imageModule = ImageModule;
        this.sortKind = ["최신순", "거리순", "가나다순"];

        this.state = {
            searchKeyWord: '',
            isRefresh: false,
            emptyListViewVisible: false,
            goodsContent: [],
            indicator: false,
            recentRadioButtonChecked: true,
            abcRadioButtonChecked: false,

            goodsQuantity: null,
            quality: 1,
            sortedKind: 0,
        };
    }

    componentDidMount() {
        this.goGetGoods();
        BackHandler.addEventListener("hardwareBackPress", this.backPressed); //뒤로가기 이벤트
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    }

    // 부품 검색
    search = (value) => {
        console.log('selected data: ', value);
        this.setState({ searchKeyWord: value });
        this.setState({ goodsContent: this.dataFiltering(value) });
    };

    // 필터링 (부품번호, 부품명 동시 검색)
    dataFiltering = (value) => {
        let goodsContent = this.contents;
        goodsContent = goodsContent.filter((content) => {
            if (value == '')
                return true;
            else {
                if (content.number == value)
                    return true;
                if (content.name.toLowerCase().includes(value.toLowerCase()))
                    return true;
                if (content.hashTag.toLowerCase().includes(value.toLowerCase()))
                    return true;
            }
        });
        this.AnimatedHeaderValue.setValue(0);
        this.setState({ goodsQuantity: goodsContent.length });
        return goodsContent;
    }

    // 품번인식 카메라로 이동
    goCameraButtonClicked = () => {
        this.props.navigation.push("PartsNoCamera", { onResultListener: this.goPartsNo });
    }

    // 품번 가지고오는 함수
    goPartsNo = (imageURI) => {
        this.callPartsNoAPI(imageURI).then((response) => {
            if (response.success === "1") {
                const partsNo = response.texts[0].replaceAll(" ", "");
                this.search(partsNo);
            }
            else {
                Alert.alert('부품번호 인식', '부품번호를 인식하지 못했습니다. 직접 입력하세요', [
                    { text: '확인', onPress: () => { this.setState({ searchKeyWord: "" }) } }]);
            }

            this.imageModule.deleteImage(imageURI, (imageURI) => {
                console.log(imageURI);
            }, (imageURI) => {
                console.log("delete success", imageURI);
            });
        });
    }

    // 부품 목록 호출 메서드
    goGetGoods = () => {
        console.log('refresh_home');
        this.setState({ indicator: true });
        this.callGetGoodsAPI().then((response) => {
            this.contents = response;
            const goodsQuantity = response.length;
            //console.log("상품 총 갯수 :", goodsQuantity);//response는 json자체
            this.setState({ indicator: false, goodsContent: response, goodsQuantity: goodsQuantity });
            this.setState({ emptyListViewVisible: response.length == 0 ? true : false })
        });
        //console.log('refresh success')
        this.setState({ isRefresh: false })
    }

    // 리스트 정렬, 1:최신순, 2:거리순, 3:가나다순
    dataSorting = (sortedKind) => {
        console.log('list Sort sortedKind = ', this.state.sortedKind);
        this.setState({ sortedKind: sortedKind });
        this.setState({ indicator: true });
        setTimeout(() => {
            let sortedData = [];
            if (sortedKind == 0) {
                sortedData = this.state.goodsContent.sort((a, b) => {
                    return b.id - a.id;
                })
            }
            else if (sortedKind == 1) {
                sortedData = this.state.goodsContent.sort((a, b) => {
                    return a.distance - b.distance;
                })
            }
            else {
                sortedData = this.state.goodsContent.sort((a, b) => {
                    return a.name.localeCompare(b.name);
                })
            }
            this.setState({ goodsContent: sortedData });
            this.setState({ indicator: false });
        }, 0);
    }


    //Web Service 시작
    //사진으로부터 품번 인식 서비스 API
    async callPartsNoAPI(imageURI) {
        let manager = new WebServiceManager(Constant.externalServiceURL + "/api/paper/DetectTexts", "post");
        manager.addBinaryData("file", {
            uri: imageURI,
            type: "image/jpeg",
            name: "file"
        });
        let response = await manager.start();
        if (response.ok)
            return response.json();
    }

    //등록된 상품 리스트 API
    async callGetGoodsAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetGoods?login_id=" + this.userID);
        let response = await manager.start();
        if (response.ok)
            return response.json();
        else
            Promise.reject(response);
    }

    //Web Service 끝

    //UI관련 메서드들
    //뒤로가기 했을 때 앱 종료
    backPressed = () => {
        Alert.alert(
            '',
            '앱을 종료하시겠습니까?',
            [
                { text: '취소', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: '확인', onPress: () => BackHandler.exitApp() },
            ],
            { cancelable: false });
        return true;
    }


    render() {
        const Header_Maximum_Height = ScreenHeight / 5;
        const Header_Minimum_Height = 110;

        const renderHeader = this.AnimatedHeaderValue.interpolate(
            {
                inputRange: [0, Header_Maximum_Height],
                outputRange: [0, -Header_Maximum_Height],
            });

        const renderSearchBar = this.AnimatedHeaderValue.interpolate(
            {
                inputRange: [0, Header_Maximum_Height],
                outputRange: [Header_Maximum_Height, 0],
                extrapolate: 'clamp'
            });

        console.log('sortKind', this.state.sortedKind);
        console.log('indicator', this.state.indicator);

        return (
            <SafeAreaView style={template.baseContainer}>
                {this.state.indicator && <Indicator />}
               
               
                {this.state.emptyListViewVisible == false && <Animated.FlatList
                    data={this.state.goodsContent}
                    numColumns={2}
                    horizontal={false}
                    renderItem={({ item, index }) => <ListItem index={index} item={item} navigation={this.props.navigation} refreshListener={this.goGetGoods} />}
                    refreshing={this.state.isRefresh} //새로고침
                    onRefresh={this.goGetGoods}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: Header_Maximum_Height + Header_Minimum_Height + 20 }}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.AnimatedHeaderValue } } }],
                        { useNativeDriver: true })}
                />}
                {this.state.emptyListViewVisible == true && <EmptyListView isRefresh={this.state.isRefresh} onRefreshListener={this.goGetGoods} contentContainerStyle={{ paddingTop: Header_Maximum_Height }} navigation={this.props.navigation} />}

               
                {/* 화면 상단 제목 부분 */}
                <Animated.View style={[inStyle.logoView, { transform: [{ translateY: renderHeader }] }]}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Image
                            style={{ width: 40, height: 40 }}
                            source={
                                require('../../images/logo/logo.png')
                            }
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[template.smallText, { color: colors.white }]}>
                            손쉽게 검색하고 판매/구매까지 바로!
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View style={[inStyle.searchView, { height: Header_Minimum_Height, transform: [{ translateY: renderSearchBar }] }]}>
                    <View style={inStyle.searchBarView}>
                        <View style={template.textInput2}>
                            <View style={{ width: '80%', flexDirection: 'row', alignItems: 'center' }}>
                                <Icon style={{ paddingLeft: 10 }} name="search" size={25} color={colors.white} />
                                <TextInput
                                    onChange={(value) => this.search(value.nativeEvent.text)}
                                    placeholder="검색어를 입력해주세요.(카메라 가능)"
                                    placeholderTextColor={colors.white}
                                    value={this.state.searchKeyWord}
                                    style={{ color: colors.white }}
                                />
                            </View>
                            <View style={{ width: '10%', justifyContent: 'flex-end' }}>
                                <TouchableOpacity
                                    style={inStyle.cameraButton}
                                    onPress={this.goCameraButtonClicked}>
                                    <Image
                                        style={{ width: 20, height: 14 }}
                                        source={
                                            require('../../images/camera/camera_blue.png')
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* 카메라로 부품번호 검색 */}

                    </View>
                    <View style={inStyle.sortView}>
                        <View style={inStyle.sortDropView}>
                            <Picker
                                style={inStyle.sortDropView.dropdown_width}
                                selectedValue={this.state.sortedKind}
                                onValueChange={(value, index) => this.dataSorting(value)}
                                mode={'dropdown'}>
                                {this.sortKind.map((item, i) => <Picker.Item label={item} key={i} value={i} color={colors.dark} style={{ fontSize: 14 }} />)}
                            </Picker>
                        </View>
                        <View style={inStyle.goodsQuantityView}>
                            <Text style={{ color: colors.dark}}>상품수 </Text>
                            <Text style={{ color: colors.main, }}>{this.state.goodsQuantity}</Text>
                        </View>
                    </View>
                </Animated.View>

            </SafeAreaView>
        );
    }
}

export default Home;

const ScreenHeight = Dimensions.get('window').height;
const ScreenWidth = Dimensions.get('window').width;

const inStyle = StyleSheet.create({
    logoView: {
        width: ScreenWidth,
        height: 170,
        paddingTop: '3%',
        alignItems: 'center',
        position: 'absolute',
        backgroundColor: colors.main,
    },
    searchView: { //home TextInput
        flexDirection: 'column',
        width: ScreenWidth,
        position: 'absolute',
        alignItems: 'center',
        backgroundColor: colors.main,
        borderBottomEndRadius: 20,
        borderBottomLeftRadius: 20,    
    },
    searchBarView: {
        flexDirection: 'row',
        marginTop: '3%',
        marginBottom: '5%',
    },
    cameraButton: {
        marginLeft: 10,
        width: 45,
        height: 45,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    sortView: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomColor: colors.line,
        borderBottomWidth: 1.5,
        height: 40,
        marginTop: '2%',
        paddingRight: '5%',
       
    },
    sortDropView: {
        flex: 1,
        flexDirection: 'row',
        height: 40,
        justifyContent: 'flex-start',
        alignItems: 'center',
        dropdown_width: {
            width: 150
        },
      
    },
    goodsQuantityView: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center'
    },
}); 