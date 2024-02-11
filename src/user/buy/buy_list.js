import React, { Component } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Modal, FlatList, Image, Alert, BackHandler,
    StyleSheet, Dimensions
} from 'react-native';

import { template, colors } from "../../styles/template/page_style";
import Constant from '../../util/constatnt_variables';
import WebServiceManager from '../../util/webservice_manager';
import Session from '../../util/session';
import FunctionUtil from '../../util/libraries_function';
import EmptyListView from '../../util/empty_list_view';

export default class BuyList extends Component {
    constructor(props) {
        super(props);

        this.userID = Session.getUserID();
        this.state = {
            buyContents: [],
            isRefresh: false,
            emptyListViewVisible: false,
        }
    }

    componentDidMount() {
        if (Session.isLoggedin()) {
            this.userID = Session.getUserID();
            this.goGetGoods();
        }
        else
            this.props.navigation.navigate('Login', { nextPage: 'BuyList' });
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        this.props.navigation.pop();
        this.props.navigation.push('TabHome', { initialTabMenu: "MyPage" });
        return true;
    }

    goGetGoods = () => {
        this.callGetGoodsAPI().then((response) => {
            this.setState({ buyContents: response, emptyListViewVisible: response.length == 0 ? true : false })
        });
    }
    //등록된 상품 리스트 API
    async callGetGoodsAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetOrders?id=" + this.userID);
        let response = await manager.start();
        if (response.ok)
            return response.json();
        else
            Promise.reject(response);
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.emptyListViewVisible == false && (<FlatList
                    data={this.state.buyContents}
                    renderItem={({ item, index }) => <ListItem index={index} item={item} navigation={this.props.navigation} refresh={this.goGetGoods} />}
                    refreshing={this.state.isRefresh}
                    onRefresh={this.goGetGoods}
                    scrollEventThrottle={16}
                />)}
                {this.state.emptyListViewVisible && <EmptyListView navigation={this.props.navigation} isRefresh={this.state.isRefresh} onRefreshListener={this.goGetGoods} />}
            </View>
        );
    }
}

class ListItem extends Component {
    constructor(props) {
        super(props);

        this.goodsID = this.props.item.goodsID;
        this.orderID = this.props.item.id;
        this.state = {
            id: "",
            imageURI: null,
            isDetailViewModal: false,
        };
    }

    componentDidMount() {

        this.callGetImageAPI().then((response) => {
            let reader = new FileReader();
            reader.readAsDataURL(response); //blob을 읽어줌 읽은 놈이 reader
            reader.onloadend = () => {
                this.setState({ imageURI: reader.result }) //base64를 imageURI에 집어넣어준다

            } //끝까지 다 읽었으면 
        });
    }
    async callGetImageAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetGoodsImage?id=" + this.goodsID + "&position=1");
        let response = await manager.start();
        if (response.ok)
            return response.blob();
    }

    goDeliveryDetailScreen = () => {
        //임시 배송조회 가능(송장번호와 택배사는 이미 존재함)
        const logisInfo = { code: "04", invoice: "651969374875" };
        this.props.navigation.navigate('DeliveryDetail', { logisInfo: logisInfo });
    }

    goOrderDetailScreen = () => {
        this.props.navigation.navigate('OrderDetail', { orderID: this.orderID, goodsID: this.goodsID })
    }
    //부품번호에 대한 Goodle 검색창 보이기(Web View)
    goGoodsNumberWebView = (goodsNo) => {
        this.props.navigation.navigate('GoogleWebView', { url: 'http://www.google.com/search?q=' + goodsNo });
    }


    orderCompleteButtonClick = () => {
        Alert.alert(
            '',
            '구매확정하신 뒤에는 반품/교환 신청하실 수 없습니다',
            [
                { text: '취소', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                {
                    text: '확인', onPress: () =>

                        this.callSetOrderCompleteAPI().then(() => {
                            //console.log('state상태', this.props.item.status);
                            this.props.refresh();
                        })
                },
            ],
            { cancelable: false });
    }

    async callSetOrderCompleteAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/SetOrderComplete?id=" + this.orderID);
        let response = await manager.start();
        if (response.ok)
            return response.json();
        else
            Promise.reject(response);
    }

    goGoodsDetailView = () => {
        this.props.navigation.navigate('GoodsDetail', { goodsID: this.goodsID });
    }

    goodsStatusText = (value) => {
        let goodsStatusText = ["배송준비중", "배송중", "배송완료"];
        return goodsStatusText[value - 1];
    }
    render() {
        const { orderingDate, goodsName, total, goodsNo, quantity, status } = this.props.item;
        return (
            <>
             
                    <View style={{ flexDirection: 'column', marginBottom: '2%', backgroundColor: colors.white }}>
                    <TouchableOpacity onPress={this.goGoodsDetailView}>
                        <View style={inStyle.itemInfoView}>
                            <View style={{ flex: 1 }}>
                                <Image
                                    source={{ uri: this.state.imageURI }}
                                    style={[inStyle.imageView2, { borderRadius: 20 }]} />
                            </View>
                            <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center' }}>
                                <View style={{ flex: 2 }}>
                                    <Text style={[template.itemNameText, { fontSize: 18 }]}>{goodsName.length > 9 ? `${goodsName.slice(0, 9)}...` : goodsName}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity onPress={() => this.goGoodsNumberWebView(goodsNo)}>
                                        <Text style={template.itemNumberText}>{goodsNo}</Text>
                                    </TouchableOpacity>
                                    <Text style={[template.itemPriceText, { fontSize: 18 }]}>{FunctionUtil.getPrice(total)}원</Text>
                                </View>
                            </View>
                            <View style={{ flex: 1.5, alignItems: 'flex-end', justifyContent: 'center' }}>
                                <View style={{ flex: 2 }}>
                                    <Text style={[template.contentText, { color: colors.dark }]}>{quantity}{"개"}</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center' }}>
                                    <Text style={[template.contentText, { color: colors.medium }]}>주문일 : {orderingDate.slice(0, 10)}</Text>
                                </View>
                            </View>
                        </View>
                        </TouchableOpacity>
                        <View style={inStyle.itemButtonView}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[template.largeText, { fontWeight: 'bold' }]}>{this.goodsStatusText(status)}</Text>
                            </View>
                            <View style={{ flex: 3, flexDirection: 'row' }}>
                                <View style={[inStyle.orderDetailButton, { marginRight: '2%' }]}>
                                    <TouchableOpacity onPress={this.goOrderDetailScreen}>
                                        <Text style={[inStyle.buttonText, { color: colors.main }]}>주문상세</Text>
                                    </TouchableOpacity>
                                </View>
                                {status != 1 &&
                                    <View style={[inStyle.button, { marginRight: '2%' }]}>
                                        <TouchableOpacity onPress={this.goDeliveryDetailScreen}>
                                            <Text style={inStyle.buttonText}>배송조회</Text>
                                        </TouchableOpacity>
                                    </View>}
                                {status == 1 &&
                                    <View style={[inStyle.button, { marginRight: '2%', backgroundColor: colors.medium }]}>
                                        <TouchableOpacity>
                                            <Text style={inStyle.buttonText}>배송조회</Text>
                                        </TouchableOpacity>
                                    </View>}
                                {status == 2 &&
                                    <View style={[inStyle.button]}>
                                        <TouchableOpacity onPress={this.orderCompleteButtonClick}>
                                            <Text style={inStyle.buttonText}>구매확정</Text>
                                        </TouchableOpacity>
                                    </View>}
                                {status != 2 &&
                                    <View style={[inStyle.button, { backgroundColor: colors.medium }]}>
                                        <TouchableOpacity >
                                            <Text style={inStyle.buttonText}>구매확정</Text>
                                        </TouchableOpacity>
                                    </View>}
                            </View>
                        </View>
                    </View >
             
            </>
        );
    }
}

const ScreenHeight = Dimensions.get('window').height;
const ScreenWidth = Dimensions.get('window').width;

const inStyle = StyleSheet.create({
    imageView2: {
        width: ScreenWidth / 5,
        height: ScreenWidth / 5,
    },
    itemInfoView: {
        flex: 5,
        flexDirection: 'row',
        paddingVertical: '4%',
        paddingHorizontal: '4%',
        borderColor: colors.line,
        borderBottomWidth: 1.5,
    },
    itemButtonView: {
        paddingHorizontal: '4%',
        flex: 1,
        flexDirection: 'row',
        height: ScreenHeight / 14,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: colors.main,
        marginVertical: '3%'
    },
    buttonText: [template.largeText, {
        color: colors.white,
    }],
    orderDetailButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 10,
        borderColor: colors.main,
        marginVertical: '3%'
    }
});