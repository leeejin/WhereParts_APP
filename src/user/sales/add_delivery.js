import React, { Component } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, NativeModules, Dimensions, BackHandler
    , StyleSheet
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { template, colors } from "../../styles/template/page_style";

import IconCamera from 'react-native-vector-icons/Feather';

import Constant from "../../util/constatnt_variables";
import WebServiceManager from "../../util/webservice_manager";
import FunctionUtil from '../../util/libraries_function';

//const ScreenHeight=Dimensions.get('window').height;
//const ScreenWidth=Dimensions.get('window').width;

class AddDelivery extends Component {
    constructor(props) {
        super(props);

        //Constant에서 미리 정의한 택배사 리스트 가져오기
        this.invoiceName = Constant.getInvoiceNames();
        this.orderID = this.props.route.params.id;

        this.state = {
            invoiceKind: 0,
            invoiceNo: "",
            imageURL: null,
            sellDetailInfo: { orderingDate: "", buyerTel: "", days: [""] },
            validForm: false,
        }
    }

    componentDidMount() {
        this.callGetSellDetailAPI().then((response) => {
            this.setState({ sellDetailInfo: response })
            console.log("days : ", this.state.sellDetailInfo.days[0]);
            this.callGetGoodsImageAPI(response.goodsID).then((response) => {
                let reader = new FileReader();
                reader.readAsDataURL(response);
                reader.onloadend = () => {
                    this.setState({ imageURL: reader.result })
                }
            });
        })
        BackHandler.addEventListener("hardwareBackPress", this.backPressed); //뒤로가기 이벤트
    }
    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    }

    goCameraButtonClicked = () => {
        this.props.navigation.push("PartsNoCamera", { onResultListener: this.goInvoiceNo });
    }

    deliveryCompleteButtonClicked = () => {
        this.callSetDeliveryAPI().then((response) => {
            console.log(response.success)
            if (response.success == 1) {
                console.log("배송신청완료", response);
                Alert.alert('배송신청완료', '배송등록이 완료되었습니다', [
                    {
                        text: '확인', onPress: () => {
                            this.props.navigation.pop();
                            this.props.route.params.navigation.navigate("SalesList");
                            if (this.props.route.params.hasOwnProperty("refresh")) {
                                this.props.route.params.refresh();
                            }
                        }
                    }
                ]);
            }
            else {
                Alert.alert('배송신청실패', '배송등록이 실패되었습니다', [
                    { text: '확인', onPress: () => { return false; } }]);
            }
        })
    }

    // 품번 가지고오는 함수 getGoodsNo
    goInvoiceNo = (imageURI) => {
        this.callDetectInvoiceNoAPI(imageURI).then((response) => {
            if (response.success === "1") {
                const invoiceNo = response.texts[0].replaceAll(" ", "");
                this.onValueChange({ invoiceNo: invoiceNo });
            }
            else {
                Alert.alert('송장번호 인식', '송장번호를 인식하지 못했습니다. 직접 입력하세요', [
                    { text: '확인', onPress: () => { this.onValueChange({ invoiceNo: "" }); } }]);
            }
            const { ImageModule } = NativeModules;
            ImageModule.deleteImage(imageURI, (imageURI) => {
                console.log(imageURI);
            }, (imageURI) => {
                console.log("delete success", imageURI);
            });
        });
    }
    //부품번호에 대한 Goodle 검색창 보이기(Web View)
    goGoodsNumberWebView = () => {
        this.props.navigation.navigate('GoogleWebView', { url: 'http://www.google.com/search?q=' + this.state.sellDetailInfo.goodsNo });
    }
    onValueChange = (value) => {
        this.setState(value, () => {
            let isValidForm = true;
            if (this.state.invoiceNo.trim().length == 0) {
                isValidForm = false;
            }

            console.log("isValidForm", isValidForm);
            this.setState({ validForm: isValidForm });
        });
    }

    async callGetSellDetailAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetSellDetail?id=" + this.orderID);
        let response = await manager.start();
        if (response.ok)
            return response.json();
    }

    async callGetGoodsImageAPI(goodsID) {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetGoodsImage?id=" + goodsID + "&position=1");
        let response = await manager.start();
        if (response.ok)
            return response.blob();
    }

    async callSetDeliveryAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/SetDelivery", "post");

        manager.addFormData("data", {
            orderID: this.orderID,
            invoiceKind: this.state.invoiceKind,
            invoiceName: this.invoiceName[(this.state.invoiceKind)],
            invoiceNo: this.state.invoiceNo,
        })

        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }

    //사진으로부터 품번 인식 서비스 API
    async callDetectInvoiceNoAPI(imageURI) {
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

    backPressed = () => {
        this.props.navigation.pop();
        return true;
    }

    render() {
        const { days, orderNo, orderingDate, goodsName, goodsNo, buyerName, buyerTel, quantity, price, total, payBank, address, zipCode } = this.state.sellDetailInfo;
        console.log('goodsName', `${goodsName}`.length);
        return (

            <View style={template.baseContainer}>
                <ScrollView >
                    <View style={inStyle.itemInfoView}>
                        <View style={{ flex: 1.5 }}>
                            <Image
                                source={{ uri: this.state.imageURL }}
                                style={[inStyle.imageView2, { borderRadius: 20 }]} />
                        </View>
                        <View style={{ flex: 1.5, alignItems: 'flex-start', justifyContent: 'center' }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[template.itemNameText, { fontSize: 18 }]}>{`${goodsName}`.length > 20 ? `${goodsName.slice(0, 20)}...` : goodsName}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                <Text style={[template.itemPriceText, { fontSize: 18 }]}>{FunctionUtil.getPrice(price * quantity)}원</Text>
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
                        <Text style={template.contentText}>결제 정보</Text>
                        <View style={inStyle.layoutBox}>
                            <View style={{ flex: 1 }}>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>결제금액</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>결제수단</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>결제사</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>결제일시</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{FunctionUtil.getPrice(`${total}` + "원")}</Text>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{"카드"}</Text>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{payBank}</Text>
                                <Text style={[template.contentText]}>{days[0]}</Text>
                            </View>

                        </View>
                        <Text style={template.contentText}>배송 정보</Text>
                        <View style={inStyle.layoutBox}>
                            <View style={{ flex: 1.5 }}>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>받는사람</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>연락처</Text>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>주소</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{buyerName}</Text>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{buyerTel.replace(/-/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}</Text>
                                <Text style={[template.contentText, { marginBottom: '2%' }]}>{zipCode}/{address}</Text>
                            </View>

                        </View>
                        <Text style={[template.contentText, { marginBottom: '2%' }]}>택배사 선택</Text>
                        <View style={template.textInput}>
                            <Picker
                                selectedValue={this.state.invoiceKind}
                                onValueChange={(value, index) => { this.setState({ invoiceKind: value }) }}>
                                {this.invoiceName.map((item, i) => <Picker.Item label={item} key={i} value={i} />)}
                            </Picker>
                        </View>
                        <Text style={[template.contentText, { marginBottom: '2%' }]}>운송장번호</Text>
                        <View style={[template.textInput, { marginBottom: '4%' }]}>
                            <View style={{ flex: 1, flexDirection: 'row', }}>
                                <View style={{ flex: 6 }}>
                                    <TextInput
                                        onChangeText={(value) => this.onValueChange({ invoiceNo: value })}
                                        value={this.state.invoiceNo} // 띄워지는값
                                    />
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', }}>
                                    <TouchableOpacity onPress={this.goCameraButtonClicked} >
                                        <Image
                                            style={{ width: 20, height: 14 }}
                                            source={
                                                require('../../images/camera/camera.png')
                                            }
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                </ScrollView>

                {this.state.validForm ?
                    (<TouchableOpacity onPress={this.deliveryCompleteButtonClicked} activeOpacity={0.8} style={template.activeButton} >
                        <Text style={template.buttonText}>배송완료</Text>
                    </TouchableOpacity>)
                    : (<TouchableOpacity activeOpacity={0.8} style={template.inActiveButton} >
                        <Text style={[template.buttonText, { color: colors.medium }]}>배송완료</Text>
                    </TouchableOpacity>)}

            </View>
        );
    }
}
export default AddDelivery;

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