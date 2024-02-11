import React, { Component } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, BackHandler, StyleSheet, Dimensions } from 'react-native';
import { template, colors } from "../../styles/template/page_style";
import Constant from '../../util/constatnt_variables';
import WebServiceManager from '../../util/webservice_manager';


class OrderDetail extends Component {
    constructor(props) {
        super(props);

        this.orderID = this.props.route.params.orderID;
        this.goodsID = this.props.route.params.goodsID;
        this.state = {
            item: {},
            days: [],
            imageURI: null,
        }
    }
    componentDidMount() {
        this.callGetImageAPI().then((response) => {
            let reader = new FileReader();
            reader.readAsDataURL(response); //blob을 읽어줌 읽은 놈이 reader
            reader.onloadend = () => {
                this.setState({ imageURI: reader.result }) //base64를 imageURI에 집어넣어준다

            } //끝까지 다 읽었으면 
        });
        this.callGetOrderDetailAPI().then((response) => {
            this.setState({ item: response, days: response.days });
            console.log(response);
        })
        BackHandler.addEventListener("hardwareBackPress", this.backPressed); //뒤로가기 이벤트
    }
    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    }

    //부품번호에 대한 Goodle 검색창 보이기(Web View)
    goGoodsNumberWebView = () => {
        this.props.navigation.navigate('GoogleWebView', { url: 'http://www.google.com/search?q=' + this.state.sellDetailInfo.goodsNo });
    }
    //웹뷰로 영수증 보기
    goReceiptWebView = () => {
        this.props.navigation.navigate('GoogleWebView', { url: this.state.item.billURL });
    }
    async callGetImageAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetGoodsImage?id=" + this.goodsID + "&position=1");
        let response = await manager.start();
        if (response.ok)
            return response.blob();
    }
    async callGetOrderDetailAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetOrderDetail?id=" + this.orderID);
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
        else
            Promise.reject(response);
    }
    backPressed = () => {
        this.props.navigation.pop();
        return true;
    }
    render() {
        const { id, orderNo, goodsName, goodsNo, buyerName, buyerTel, quantity, price, total, orderingDate, payKind, payBank, address, status, days, invoiceName, invoiceNo } = this.state.item;

        return (
            <View style={template.baseContainer}>
                <ScrollView>
                    <View style={inStyle.itemInfoView}>
                        <View style={{ flex: 1 }}>
                            <Image
                                source={{ uri: this.state.imageURI }}
                                style={[inStyle.imageView2, { borderRadius: 20 }]} />
                        </View>
                        <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center' }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[template.itemNameText, { fontSize: 18 }]}>{`${goodsName}`.length > 9 ? `${goodsName.slice(0, 9)}...` : goodsName}</Text>
                                <TouchableOpacity onPress={this.goGoodsNumberWebView}>
                                    <Text style={template.itemNumberText}>{goodsNo}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                <Text style={[template.itemPriceText, { fontSize: 18 }]}>{total}원</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1.5, alignItems: 'flex-end', justifyContent: 'center' }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[template.contentText, { color: colors.dark }]}>{quantity}{"개"}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={inStyle.itemOrderNoView}>
                        <View style={{ flex: 1, }}>
                            <Text style={[template.largeText, { color: colors.dark }]}>주문번호</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={template.largeText}>{orderNo}</Text>
                        </View>
                    </View>
                    <View style={inStyle.bodyView}>
                        <Text style={template.contentText}>주문자 정보</Text>
                        <View style={inStyle.layoutBox}>
                            <View style={{ flex: 1 }}>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>주문자 이름</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>연락처</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>주소</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{buyerName}</Text>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{buyerTel}</Text>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{address}</Text>
                            </View>

                        </View>
                        <Text style={template.contentText}>결제 정보</Text>
                        <View style={inStyle.layoutBox}>
                            <View style={{ flex: 1.5 }}>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>결제금액</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>결제수단</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>결제사</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>결제일시</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>영수증</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{total}</Text>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>카드</Text>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>신한카드</Text>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{this.state.days[0]}</Text>
                                <TouchableOpacity onPress={this.goReceiptWebView}>
                                    <Text style={[template.contentText, { marginBottom: '2%', color: colors.main }]}>확인하기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {status != 1 &&
                            <>
                                <Text style={template.contentText}>배송 정보</Text>
                                <View style={inStyle.layoutBox}>
                                    <View style={{ flex: 1.5 }}>
                                        <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>택배사</Text>
                                        <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>운송장번호</Text>
                                        <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>배송시작일시</Text>
                                        <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>배송완료일시</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                        <Text style={[template.contentText, { marginBottom: '2%' }]}>{invoiceName}</Text>
                                        <Text style={[template.contentText, { marginBottom: '2%' }]}>{invoiceNo}</Text>
                                        <Text style={[template.contentText, { marginBottom: '2%' }]}>{this.state.days[1]}</Text>
                                        <Text style={[template.contentText, { marginBottom: '2%' }]}>{this.state.days[2]}</Text>
                                    </View>
                                </View>
                            </>
                        }
                    </View>
                </ScrollView>
            </View>
        );
    }
}
export default OrderDetail;

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
    itemOrderNoView: {
        borderColor: colors.line,
        borderBottomWidth: 1.5,
        flexDirection: 'row',
        paddingVertical: '2%',
        paddingHorizontal: '4%',
    },
    bodyView: {
        paddingVertical: '4%',
        paddingHorizontal: '4%',
    },
    layoutBox: {
        paddingHorizontal: '7%',
        paddingVertical: '4%',
        marginBottom: '4%',
        flexDirection: 'row',
        borderColor: colors.line,
        borderBottomWidth: 1.5
    }
});