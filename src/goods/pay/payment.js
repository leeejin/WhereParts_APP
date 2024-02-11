import React, { Component } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, NativeModules, Pressable, TextInput, Image, Keyboard, Alert,
    StyleSheet, Dimensions
} from 'react-native';

import Constant from '../../util/constatnt_variables';
import WebServiceManager from '../../util/webservice_manager';
import FunctionUtil from '../../util/libraries_function';

import { template, colors } from "../../styles/template/page_style";
import QuantityEditIcon from 'react-native-vector-icons/Feather';


class Payment extends Component {
    constructor(props) {
        super(props);

        this.buyerName = React.createRef();
        this.buyerTel = React.createRef();

        this.item = this.props.route.params.item;
        this.userID = this.props.route.params.userID;

        this.state = {
            imageURL: null,
            buyerName: "",
            buyerTel: "",
            zipNo: "",
            roadAddr: "",
            address: "",
            detailAddress: '',
            bigo: "",
            validForm: false,

            quantity: 1,
            paymentMethod: 1,
            orderNo: null
        }
    }

    componentDidMount() {
        console.log('item=', this.item);
        this.callGetGoodsImageAPI(this.item.id).then((response) => {
            let reader = new FileReader();
            reader.readAsDataURL(response);
            reader.onloadend = () => {
                this.setState({ imageURL: reader.result })
            }
        });

        this.callGetOrderNoAPI().then((response) => {
            console.log('orderNo', response);
            if (response.success == 1)
                this.setState({ orderNo: response.orderNo });
            else {
                Alert.alert('구매불가', '일시적인 오류로 상품을 구매할 수 없습니다.', [
                    { text: '확인', onPress: () => { this.props.navigation.pop() } },
                ]);
            }
        });
    }


    countPlus = () => {
        if (this.state.quantity > 0 && this.state.quantity < this.item.quantity)
            this.setState({ quantity: this.state.quantity + 1 });
    }

    countMinus = () => {
        if (this.state.quantity <= 1) {
            this.setState({ quantity: 1 });
        }
        else {
            this.setState({ quantity: this.state.quantity - 1 });
        }
    }

    getAddressInfo = (zipNo, roadAddr) => {
        this.onValueChange({ zipNo: zipNo, roadAddr: roadAddr });
    }

    onValueChange = (value) => {
        this.setState(value, () => {
            let isValidForm = true;

            //주문자
            if (this.state.buyerName.length == 0) {
                isValidForm = false;
            }
            //연락처
            if (this.state.buyerTel.length == 0) {
                isValidForm = false;
            }
            //우편번호
            if (this.state.zipNo.trim().length == 0) {
                isValidForm = false;
            }
            //도로명주소
            if (this.state.roadAddr.trim().length == 0) {
                isValidForm = false;
            }
            //상세주소
            if (this.state.detailAddress.length == 0) {
                isValidForm = false;
            }
            this.setState({ validForm: isValidForm });
        });
    }

    //결제하기 버튼 클릭시
    paymentButtonClicked = () => {
        const { id, name, price } = this.item;
        const payload = {
            orderNo: this.state.orderNo,
            goodsName: name,
            goodsID: id,
            quantity: this.state.quantity,
            price: price
        };
        this.callAndroidPaymentActivity(payload);
    }

    //안드로이 네이티브 결제 액티비티 호출
    callAndroidPaymentActivity = (payload) => {
        console.log("결제정보", payload);
        const { ActivityStartModule } = NativeModules;
        ActivityStartModule.startPayment(JSON.stringify(payload), failedListener = (message) => {
            console.log('취소', message);
        }, successListener = (message) => {
            console.log('완료', message);
            const paymentData = JSON.parse(message);
            console.log('data=', paymentData.data);
            const addOrderData = this.getAddOrderData(paymentData);
            console.log('payment data=', addOrderData);

            this.callAddOrderAPI(addOrderData).then((response) => {
                console.log('addOrder response message', response);
                this.props.navigation.navigate('PayComplete', { orderID: response.success });
            });
        });
    }

    //AddOrder API호출에 필요한 데이터 생성
    getAddOrderData = (paymentData) => {
        //const cardData = JSON.parse(paymentData.card_data);
        const address = this.state.roadAddr + " " + this.state.detailAddress;
        const { orderNo, quantity, buyerName, buyerTel, bigo, zipNo } = this.state;
        const { id, price } = this.item;

        const payload = {
            orderNo: orderNo,
            buyerID: this.userID,
            goodsID: id,
            quantity: quantity,
            price: price,
            //total:paymentData.data.price,
            total: quantity * price,
            buyerName: buyerName,
            buyerTel: buyerTel,
            payKind: paymentData.data.method_origin,
            payBank: paymentData.data.card_data.card_company,
            address: address,
            zipCode: zipNo,
            bigo: bigo,
            receiptID: paymentData.data.receipt_id,
            billURL: paymentData.data.receipt_url
        };
        return payload;
    }

    //부품번호에 대한 Goodle 검색창 보이기(Web View)
    goGoodsNumberWebView = () => {
        this.props.navigation.navigate('GoogleWebView', { url: 'http://www.google.com/search?q=' + this.item.number });
    }

    async callAddOrderAPI(formData) {
        let manager = new WebServiceManager(Constant.serviceURL + "/AddOrder", "post");
        manager.addFormData("data", formData);
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }
    async callGetGoodsImageAPI(goodsID) {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetGoodsImage?id=" + goodsID + "&position=1");
        let response = await manager.start();
        if (response.ok)
            return response.blob();
    }

    async callGetOrderNoAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetOrderNo?id=" + this.userID);
        let response = await manager.start();
        if (response.ok)
            return response.json();
    }

    render() {
        let renderTotalPirce = FunctionUtil.getPrice(this.item.price * this.state.quantity);

        return (
            <View style={template.baseContainer}>
                <ScrollView>
                    <View style={inStyle.itemInfoView}>
                        <View style={{ flex: 1 }}>
                            <Image
                                source={{ uri: this.state.imageURL }}
                                style={[inStyle.imageView2, { borderRadius: 20 }]} />
                        </View>
                        <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center' }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[template.itemNameText, { fontSize: 18 }]}>{this.item.name.length > 9 ? `${this.item.name.slice(0, 9)}...` : this.item.name}</Text>
                                <TouchableOpacity onPress={this.goGoodsNumberWebView}>
                                    <Text style={template.itemNumberText}>{this.item.number}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                <Text style={[template.itemPriceText, { fontSize: 18 }]}> {renderTotalPirce}원</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1.5, alignItems: 'flex-end', justifyContent: 'center' }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[template.contentText, { color: colors.dark }]}>{"구매가능 수량 : "}{this.item.quantity}{"개"}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                                    <View style={template.countingBox}>
                                        <TouchableOpacity activeOpacity={0.8}  onPress={() => this.countMinus(this.state.quantity)} >
                                            <QuantityEditIcon name='minus' color={colors.medium} size={15}></QuantityEditIcon>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[template.countingBox, { width: 34, height: 34, borderColor: colors.black }]}>
                                        <Text style={template.contentText}>{this.state.quantity}</Text>
                                    </View>
                                    <View style={template.countingBox}>
                                        <TouchableOpacity activeOpacity={0.8} onPress={() => this.countPlus(this.state.quantity)}>
                                            <QuantityEditIcon name='plus' color={colors.medium} size={15}></QuantityEditIcon>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                        </View>
                    </View>
                    <View style={inStyle.itemOrderNoView}>
                        <View style={{ flex: 1, }}>
                            <Text style={[template.largeText, { color: colors.dark }]}>주문번호</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={template.largeText}>{this.state.orderNo}</Text>
                        </View>
                    </View>
                    <View style={inStyle.bodyView}>
                        <Text style={template.largeText}>배송 정보</Text>
                        <View style={[inStyle.layoutBox]}>
                            <TextInput style={template.textInput}
                                ref={(c) => { this.buyerName = c; }}
                                returnKeyType="next"
                                onSubmitEditing={() => { this.buyerTel.focus(); }}
                                placeholder="주문자 이름을 입력하세요"
                                placeholderTextColor={colors.dark}
                                onChangeText={(value) => this.onValueChange({ buyerName: value })}
                                value={this.state.buyerName} />
                            <TextInput style={template.textInput}
                                ref={(c) => { this.buyerTel = c; }}
                                returnKeyType="next"
                                placeholder="연락처를 입력하세요"
                                placeholderTextColor={colors.dark}
                                onChangeText={(value) => this.onValueChange({ buyerTel: value })}
                                value={this.state.buyerTel} />

                        </View>

                        <View style={[inStyle.layoutBox, { borderBottomWidth: 0, }]}>
                            <Text style={[template.contentText, { marginBottom: '4%' }]}>주소</Text>
                            <View style={{ flex: 1, flexDirection: 'row', }}>
                                <TouchableOpacity style={[template.textInput, { flex: 6 }]} onPress={() => this.props.navigation.navigate("SearchAddress", { addressListener: this.getAddressInfo })}>
                                    <Text style={[template.contentText]}>{this.state.zipNo}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity activeOpacity={0.8} style={inStyle.addressButton} onPress={() => this.props.navigation.navigate("SearchAddress", { addressListener: this.getAddressInfo })}>
                                    <Text style={[template.contentText, { color: colors.white }]}>우편번호 찾기</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[template.textInput]}>
                                <Text style={[template.contentText]}>{this.state.roadAddr}</Text>
                            </View>

                            <TextInput style={template.textInput}
                                placeholder="상세 주소를 입력하세요"
                                placeholderTextColor={colors.dark}
                                onChangeText={(value) => this.onValueChange({ detailAddress: value })}
                                //onEndEditing={(event)=> this.onValueChange()}
                                value={this.state.detailAddress} />

                            <TextInput style={template.textInput}
                                placeholder="배송요청사항"
                                placeholderTextColor={colors.dark}
                                onChangeText={(value) => this.setState({ bigo: value })}
                                value={this.state.bigo} />
                        </View>

                    </View>
                </ScrollView>
                {
                    this.state.validForm ?
                        (<TouchableOpacity style={template.activeButton} onPress={this.paymentButtonClicked}><Text style={template.buttonText}>결제하기</Text></TouchableOpacity>)
                        : (<TouchableOpacity style={template.inActiveButton} ><Text style={[template.buttonText, { color: colors.medium }]}>결제하기</Text></TouchableOpacity>)
                }
            </View>
        );
    }
}

export default Payment;

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
        marginBottom: '2%',
        borderColor: colors.line,
        borderBottomWidth: 1.5
    },
    addressButton: {
        flex: 4,
        height: 40,
        backgroundColor: "black",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginLeft: '3%'
    }
});