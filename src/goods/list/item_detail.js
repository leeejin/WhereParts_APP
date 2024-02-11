import React, { Component, PureComponent, useMemo } from 'react';
import {
    ScrollView, Pressable, View, Text,
    Image, FlatList, TouchableOpacity, Alert, BackHandler, Modal,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import { SwiperFlatList } from 'react-native-swiper-flatlist';

import { template, colors } from '../../styles/template/page_style';
import { styles } from "../../styles/list/home_item_detail";
import IconRadio from 'react-native-vector-icons/Ionicons';
import IconPopup from 'react-native-vector-icons/EvilIcons';

import Icon from 'react-native-vector-icons/MaterialIcons';
import MapIcon2 from 'react-native-vector-icons/FontAwesome5';
import QuantityEditIcon from 'react-native-vector-icons/Feather';

import Constant from '../../util/constatnt_variables';
import Session from '../../util/session';
import FunctionUtil from '../../util/libraries_function';
import WebServiceManager from '../../util/webservice_manager';

export default class DetailItemView extends Component {
    constructor(props) {
        super(props);
        this.hashTagRef = React.createRef();
        //this.goodsQuality = Constant.getGoodsQuality();

        //상수 가져오기
        this.getQualityValueText = Constant.getGoodsQuality();
        this.getGenuineValueText = Constant.getGoodsGenuine();

        this.goodsID = this.props.route.params.goodsID;
        this.sellerID = this.props.route.params.sellerID;
        this.userID = Session.getUserID();

        this.state = {
            images: [],
            item: {}, //상품 상세정보

            price: 0,
            quantity: 1, // 수량
            tagName: '',
            hashTag: [],
            quality: 1, // 상품상태
            genuine: 1,
            editSpec: "",
            registerDate: "",

            dipsbuttonclicked: false,//찜하기
            editGoodsViewVisible: false,
            editVisible: false,//수정가능
            buyVisible: false,//구매가능
            imageVisible: false,//큰사진보기
            validForm: true,
            selectedImageIndex: 0,
        }
    }

    componentDidMount() {
        this.callImageLengthAPI().then((response) => {
            console.log('Image length', response);

            for (let i = 1; i <= response.length; i++) {
                this.callGetImageAPI(i).then((response) => {
                    let reader = new FileReader();
                    reader.readAsDataURL(response); //blob을 읽어줌 읽은 놈이 reader
                    reader.onloadend = () => {
                        const images = this.state.images;
                        images.push(reader.result.replace("application/octet-stream", "image/jpeg"));
                        console.log(images.length);
                        this.setState({ images: images });
                    }
                })
            }
        });

        this.callGetGoodsDetailAPI().then((response) => {
            this.setState({
                item: response,
                hashTag: response.hashTag.split(',').map(tag => `${tag}`),
                price: response.price,
                editSpec: response.spec,
                quantity: response.quantity,
                quality: response.quality,
                genuine: response.genuine,
                registerDate: response.registerDate,
            });
            console.log(response);

            //user와 seller 구분
            if (this.userID == this.sellerID) {
                this.setState({ editVisible: true })
            }
            else { //구매가능
                this.setState({ buyVisible: true })
                this.callGetWishIdAPI().then((response) => {
                    if (response.includes(this.goodsID) == true) {
                        this.setState({ dipsbuttonclicked: true })
                    }
                });
            }
        })
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
    }

    //상단 Bar부분
    // 수정 버튼 클릭
    editButtonClicked = () => {
        this.setState({ editGoodsViewVisible: true });
        this.onValueChange();
    }
    //수정 취소 버튼 클릭
    editCancelButtonClicked = () => {
        const { price, quantity, quality, genuine, spec } = this.state.item;
        const hashTag = this.state.item.hashTag.split(',').map(tag => `${tag}`);
        Alert.alert(
            '',
            '수정을 취소 하시겠어요?',
            [
                { text: '취소', onPress: () => console.log('Cancel Pressed') },
                { text: '확인', onPress: () => this.setState({ editGoodsViewVisible: false, price: price, quantity: quantity, hashTag: hashTag, quality: quality, genuine: genuine, editSpec: spec }) },
            ],);
    }
    //숨김버튼 클릭
    goodsDisableButtonClicked = () => {
        Alert.alert(
            '',
            '상품을 숨기겠습니까?',
            [
                { text: '취소', onPress: () => console.log('Cancel Pressed') },
                {
                    text: '확인', onPress: () => this.callSetDisableGoodsAPI().then((response) => {
                        console.log("숨김완료", response);
                        if (response.success == 1) {
                            this.props.navigation.pop();
                            this.refresh();
                        }
                    })
                },
            ],);
    }

    //숨김해제 버튼 클릭
    goodsEnableButtonClicked = () => {
        Alert.alert(
            '',
            '상품 숨기기를 해제하시겠습니까?',
            [
                { text: '취소', onPress: () => console.log('Cancel Pressed') },
                {
                    text: '확인', onPress: () => this.callSetEnableGoodsAPI().then((response) => {
                        console.log("숨김해제완료", response);
                        if (response.success == 1) {
                            this.props.navigation.pop();
                            this.refresh();
                        }
                    })
                },
            ],);
    }
    //삭제버튼 클릭
    removeButtonClicked = () => {
        Alert.alert(
            '',
            '상품을 정말 삭제 하시겠어요?',
            [
                { text: '취소', onPress: () => console.log('Cancel Pressed') },
                {
                    text: '확인', onPress: () => this.callRemoveGoodsAPI().then((response) => {
                        console.log("삭제완료", response);
                        this.props.navigation.pop();
                        this.refresh();
                    })
                },
            ],);
    }

    //하단 Bar부분
    // 구매하기 버튼 클릭
    buyButtonClicked = () => {
        this.props.navigation.navigate("Payment", { item: this.state.item, userID: this.userID });
    }
    // 수정완료 버튼 클릭
    editCompleteButtonClicked = () => {
        console.log("수정완료버튼클릭");
        this.callUpdateGoodsAPI().then((response) => {
            console.log('수정완료', response)
            if (response.success == 1) {
                Alert.alert(
                    '',
                    '수정이 완료되었습니다',
                    [
                        { text: '취소', onPress: () => console.log('Cancel Pressed') },
                        {
                            text: '확인', onPress: () => {
                                console.log('수정완료'); //this.refresh();
                            }
                        },
                    ],);
            }
            if (this.state.editGoodsViewVisible == true) {
                this.setState({ editGoodsViewVisible: false });
            }
        })
    }
    dipsButtonClicked = () => {
        if (this.state.dipsbuttonclicked == false) {
            this.callAddWishAPI().then((response) => {
                console.log("add wish", response);
            })
            this.setState({ dipsbuttonclicked: true });
        } else {
            this.callRemoveWishAPI().then((response) => {
                console.log("remove wish", response);
            })
            this.setState({ dipsbuttonclicked: false })
        }
    }

    onValueChange = (value) => {
        this.setState(value, () => {
            let isValidForm = true;
            console.log("hashTag_length", this.state.hashTag.length);

            if (this.state.price.length == 0) {
                isValidForm = false;
            }
            if (this.state.price <= 0) {
                isValidForm = false;
            }
            if (this.state.hashTag.length <= 0) {
                isValidForm = false;
            }

            console.log("isValidForm", isValidForm);
            this.setState({ validForm: isValidForm });
        });
    }

    //item_detail
    handleModal = (index) => {
        this.setState({
            imageVisible: !this.state.imageVisible,
            selectedImageIndex: index
        })
    };
    qualityValueText = (value) => {
        return this.getQualityValueText[value - 1];
    }

    genuineValueText = (value) => {
        return this.getGenuineValueText[value - 1];
    }

    //부품번호에 대한 Goodle 검색창 보이기(Web View)
    goGoodsNumberWebView = () => {
        this.props.navigation.navigate('GoogleWebView', { url: 'http://www.google.com/search?q=' + this.state.item.number });
    }

    //수정하기
    addTag = () => {
        const tagNames = this.state.tagName.split(' ');

        if (tagNames.slice(-1)[0] == '') {
            tagNames.splice(tagNames.length - 1)
        }
        if (this.state.hashTag.length <= 7 && tagNames.length <= 7 && this.state.hashTag.length + tagNames.length <= 7) {
            this.onValueChange({ hashTag: this.state.hashTag.concat(tagNames) });
        }
        else {
            this.setState({ hashTagError: false })
        }

        this.state.tagName = ""
        this.hashTagRef.clear();
    }

    // 해시태그 삭제할 때
    hashTagRemove = (index) => {
        this.onValueChange({ hashTag: this.state.hashTag.filter((_, indexNum) => indexNum !== index) });
    }
    // 해시태그 특수문자 입력시 삭제
    hashTagOnChangeText = (value) => {
        const reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/;
        let newTagName = value.replace(reg, '');
        this.setState({ tagName: newTagName });
    }

    // 판매수량 수정 버튼 클릭
    editMinus = (value) => {
        if (value <= 1) {
            this.setState({ quantity: 1 });
        }
        else {
            this.setState({ quantity: value - 1 });
        }
    }

    editPlus = (value) => {
        this.setState({ quantity: value + 1 });
    }

    //정품 클릭
    genuineCheck = () => {
        this.setState({ genuine: 1 });
    }
    //비정품 클릭
    non_genuineCheck = () => {
        this.setState({ genuine: 2 });
    }
    //상품상태 글릭
    qualityCheck = (index) => {
        this.setState({ quality: index, })
        console.log('quality', index)
    }
    refresh = () => {
        this.props.route.params.refresh();
    }

    backPressed = () => {
        if (this.state.editGoodsViewVisible == true) {
            this.editCancelButtonClicked();
        }
        else {
            this.props.navigation.pop();
        }

        if (this.props.route.params.hasOwnProperty('pickRefreshListener')) {
            this.props.route.params.pickRefreshListener();
        }
        return true;
    }
    // 상품 이미지 갯수
    async callImageLengthAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetGoodsImageLength?id=" + this.goodsID)
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }
    // 썸네일 사진
    async callGetImageAPI(position) {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetGoodsImage?id=" + this.goodsID + "&position=" + position);
        let response = await manager.start();
        if (response.ok)
            return response.blob();
    }
    // 상품 상세 정보
    async callGetGoodsDetailAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetGoodsDetail?login_id=" + this.userID + "&id=" + this.goodsID);
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }
    // 상품 수정
    async callUpdateGoodsAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/UpdateGoods", "post");
        const price = parseInt(this.state.price.toString().replace(/,/g, ''));

        const editItem = {
            id: this.goodsID,
            quantity: this.state.quantity,
            quality: this.state.quality,
            price: price,
            genuine: this.state.genuine,
            spec: this.state.editSpec,
            hashTag: this.state.hashTag.toString(),
        };

        manager.addFormData("data", {
            id: editItem.id,
            quantity: editItem.quantity,
            quality: editItem.quality,
            price: editItem.price,
            genuine: editItem.genuine,
            spec: editItem.spec,
            hashTag: editItem.hashTag,
        });

        let response = await manager.start();// --끝났다
        if (response.ok) {
            return response.json();
        }
    }
    // 상품 삭제
    async callRemoveGoodsAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/RemoveGoods?id=" + this.goodsID);
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }
    // 상품 숨김
    async callSetDisableGoodsAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/SetDisableGoods?id=" + this.goodsID);
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }
    // 상품 숨김해제
    async callSetEnableGoodsAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/SetEnableGoods?id=" + this.goodsID);
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }

    // 관심목록상품 등록
    async callAddWishAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/AddWishList?user_id=" + this.userID + "&goods_id=" + this.goodsID);
        let response = await manager.start();
        if (response.ok)
            return response.json();
    }
    // 관심목록상품 해제
    async callRemoveWishAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/RemoveWishList?user_id=" + this.userID + "&goods_id=" + this.goodsID)
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }
    // 관심목록
    async callGetWishIdAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetWishIdList?user_id=" + this.userID);
        let response = await manager.start();
        if (response.ok)
            return response.json();
        else
            Promise.reject(response);
    }

    render() {
        const renderPrice = FunctionUtil.getPrice(this.state.price);

        return (
            <View style={styles.itemDetail_view}>

                <View style={styles.itemView}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* 이미지 리스트 */}
                        <View style={styles.slideImage_view}>
                            <SwiperFlatList
                                data={this.state.images}
                                showPagination={true}
                                onPaginationSelectedIndex={true}
                                paginationActiveColor='black'
                                paginationStyleItem={{ width: 10, height: 10 }}
                                paginationStyleItemActive={{ width: 10, height: 10 }}
                                renderItem={item => (
                                    <ImageView image={item.item} index={item.index} handleModal={this.handleModal} />
                                )}
                                horizontal={true}
                            />
                        </View>

                        {/* 상품 사진 확대 모달 */}
                        <Modal visible={this.state.imageVisible} onRequestClose={() => this.setState({ imageVisible: !this.state.imageVisible })}>
                            <View style={styles.imageDetailView}>
                                <FlatList
                                    showsHorizontalScrollIndicator={false}
                                    data={this.state.images}
                                    renderItem={(item) => <ImageModal image={item.item} imageModal={this.handleModal} />}
                                    initialScrollIndex={this.state.selectedImageIndex}
                                />
                            </View>
                        </Modal>


                        {/*  상품 디테일 */}

                        <View style={styles.goodsInfoTopView}>
                            {!this.state.editGoodsViewVisible && <>
                                <View style={{ flex: 1 }}>
                                    {/* 상품명 */}
                                    <View style={{ flex: 1, marginBottom: '3%' }}>
                                        <Text style={[template.titleText, { fontSize: 23 }]}>{this.state.item.name}</Text>
                                    </View>
                                    {/* 상품번호 */}
                                    <View style={{ flex: 1, marginBottom: '3%' }}>
                                        <TouchableOpacity onPress={this.goGoodsNumberWebView}>
                                            <Text style={[template.itemNumberText, { fontSize: 18 }]}>{this.state.item.number}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        {/* 정품 */}
                                        <View style={styles.roundedBox}>
                                            <Text style={[template.contentText, { fontWeight: '5700' }]}>
                                                {this.genuineValueText(this.state.genuine)}
                                            </Text>
                                        </View>
                                        {/* 상태 */}
                                        <View style={styles.roundedBox}>
                                            <Text style={[template.contentText, { fontWeight: '5700' }]}>
                                                {this.qualityValueText(this.state.quality)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flex: 1.5 }}>
                                    {/* 인증 마크 => TODO 인증 업체일 경우에만 뜨도록 설정 */}
                                    <View style={styles.textRightView}>
                                        <Image
                                            style={{ width: 17, height: 16.85 }}
                                            source={
                                                require('../../images/icon/certified-icon/certified.png')
                                            }
                                        />
                                    </View>
                                    {/* 수량 */}
                                    <View style={[styles.textRightView]}>
                                        {(this.state.quantity == 0 || this.state.item.removeFlag == 1 || this.state.item.valid == 0) && this.state.buyVisible ?
                                            <Text style={[template.largeText, { fontSize: 18, color: colors.red }]}>구매 불가</Text> :
                                            <Text style={[template.largeText, { fontSize: 18 }]}>
                                                <Text style={[template.largeText, { fontSize: 18, color: colors.dark }]}>남은개수 </Text>
                                                {this.state.quantity}개
                                            </Text>}
                                    </View>
                                    <View style={[styles.textRightView, { flexDirection: 'row' }]}>
                                        <MapIcon2 name='map-marker' color={colors.dark} size={13}></MapIcon2>
                                        <Text style={[template.contentText, { color: colors.dark }]}> {this.state.item.distance}km  |  </Text>
                                        <Text style={[template.contentText, { color: colors.dark }]}>{this.state.item.registerDate}</Text>
                                    </View>
                                </View>
                            </>}

                            {/* 수정창 */}
                            {this.state.editGoodsViewVisible && <>
                                <View style={{ flex: 1 }}>
                                    {/* 상품명 */}
                                    <View style={{ flex: 1, marginBottom: '3%' }}>
                                        <Text style={[template.titleText, { fontSize: 23 }]}>{this.state.item.name}</Text>
                                    </View>
                                    {/* 상품번호 */}
                                    <View style={{ flex: 1, marginBottom: '3%' }}>
                                        <TouchableOpacity onPress={this.goGoodsNumberWebView}>
                                            <Text style={[template.itemNumberText, { fontSize: 18, color: colors.dark }]}>{this.state.item.number}</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                                <View style={{ flex: 1.5 }}>
                                    {/* 인증 마크 => TODO 인증 업체일 경우에만 뜨도록 설정 */}
                                    <View style={styles.textRightView}>
                                        <Image
                                            style={{ width: 17, height: 16.85 }}
                                            source={
                                                require('../../images/icon/certified-icon/certified.png')
                                            }
                                        />
                                    </View>
                                    <View style={[styles.textRightView]}>
                                        <Text style={[template.contentText, { color: colors.dark }]}>{this.state.item.registerDate}</Text>
                                    </View>
                                </View>
                            </>}
                        </View>

                        {!this.state.editGoodsViewVisible && <>
                            <View style={styles.goodsInfoBodyView}>
                                {/*판매자글 */}
                                <Text style={template.largeText}>
                                    {this.state.editSpec}
                                </Text>

                            </View>
                            <View style={[styles.goodsInfoBodyView, { borderBottomWidth: 0, justifyContent: 'flex-end' }]}>
                                {this.state.hashTag.map((tag, index) => (
                                    <View style={{ marginRight: 8, }} key={index}>
                                        <Text style={[template.contentText, { color: colors.dark }]}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </>}
                        {/* 토글 디테일 */}
                        {this.state.editGoodsViewVisible &&
                            <View style={styles.toggleDetail_view}>

                                {/* 수정 모아보기 */}
                                {/* 상품정보 부분 */}
                                <View style={template.lineBox}>
                                    {/* 금액, 수량 수정 */}
                                    <Text style={[template.largeText, { marginBottom: '3%' }]}>상품 정보</Text>

                                    {/* 판매금액 */}
                                    <View style={[template.textInput, { paddingVertical: '0%', flexDirection: 'row', alignItems: 'center' }]}>
                                        <Text style={{ flex: 1, }}>판매 금액(개당)</Text>
                                        <TextInput
                                            style={[template.inputText, { flex: 1, textAlign: 'right', paddingRight: '2%' }]}
                                            ref={(c) => { this.priceRef = c; }}
                                            onSubmitEditing={() => { this.hashTagRef.focus(); }}
                                            keyboardType="number-pad"
                                            onChangeText={(value) => this.onValueChange({ price: value })}
                                        >{renderPrice}</TextInput>
                                        <View>
                                            <Text style={[template.smallText, { color: colors.black, fontWeight: 'bold' }]}>원</Text>
                                        </View>

                                    </View>

                                    {/* 판매수량 */}
                                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                                        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                                            <Text style={template.contentText}>판매 수량</Text>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                                            <View style={template.countingBox}>
                                                <TouchableOpacity activeOpacity={0.8} onPress={() => this.editMinus(this.state.quantity)}>
                                                    <QuantityEditIcon name='minus' color={colors.medium} size={15}></QuantityEditIcon>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={[template.countingBox, { width: 34, height: 34, borderColor: colors.black }]}>
                                                <Text style={template.contentText}>{this.state.quantity}</Text>
                                            </View>
                                            <View style={template.countingBox}>
                                                <TouchableOpacity activeOpacity={0.8} onPress={() => this.editPlus(this.state.quantity)}>
                                                    <QuantityEditIcon name='plus' color={colors.medium} size={15}></QuantityEditIcon>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    </View>
                                </View>

                                <View style={template.lineBox}>
                                    <Text style={[template.largeText, { marginBottom: '3%' }]}>기타 정보</Text>
                                    {/*정품/비정품*/}
                                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginBottom: '3%' }}>
                                        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                                            <Text style={template.contentText}>정품 유무</Text>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}>
                                            <TouchableOpacity activeOpacity={0.8} onPress={this.genuineCheck} style={{ flexDirection: 'row' }}>
                                                <IconRadio name={this.state.genuine == 1 ? "checkmark-circle" : "ellipse-outline"} size={20} color={colors.main} />
                                                <View style={{ justifyContent: 'center' }}>
                                                    <Text style={[template.contentText]}>{this.getGenuineValueText[0]}</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity activeOpacity={0.8} onPress={this.non_genuineCheck} style={{ flexDirection: 'row', marginLeft: '5%' }}>
                                                <IconRadio name={this.state.genuine == 2 ? "checkmark-circle" : "ellipse-outline"} size={20} color={colors.main} />
                                                <View style={{ justifyContent: 'center' }}>
                                                    <Text style={[template.contentText]}> {this.getGenuineValueText[1]}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                    {/*상품상태*/}
                                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginBottom: '3%' }}>
                                        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                                            <Text style={template.contentText}>상품 상태</Text>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}>
                                            {this.getQualityValueText.map((item, i) =>
                                                <TouchableOpacity key={i} activeOpacity={0.8} onPress={() => this.qualityCheck(i + 1)} style={{ flexDirection: 'row', marginLeft: '5%' }}>
                                                    <IconRadio name={this.state.quality == i + 1 ? "checkmark-circle" : "ellipse-outline"} size={20} color={colors.main} />
                                                    <View style={{ justifyContent: 'center' }}>
                                                        <Text style={[template.contentText]}>{item}</Text>
                                                    </View>
                                                </TouchableOpacity>

                                            )}
                                        </View>
                                    </View>



                                    {/* 검색어 */}
                                    <View style={[template.textInput, { flexDirection: 'row', alignItems: 'center' }]}>
                                        <View style={{ flex: 7 }}>
                                            <TextInput
                                                style={template.inputText}
                                                ref={(c) => { this.hashTagRef = c; }}
                                                returnKeyType="next"
                                                onSubmitEditing={() => this.addTag()}
                                                onChangeText={(value) => this.hashTagOnChangeText(value)}
                                                value={this.state.tagName}
                                                placeholder='검색어(최대 7개)'
                                                placeholderTextColor={colors.dark}
                                            />
                                        </View>
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <TouchableOpacity onPress={() => this.addTag()}>
                                                <IconRadio name={"add-circle"} size={30} color={colors.dark} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {this.state.hashTagError == false ? (
                                        <Text style={{ color: colors.red, fontSize: 12, marginBottom: '2%' }}>
                                            * 1 - 7개 입력
                                        </Text>
                                    ) : null}
                                    {/* 키워드 뿌려주기 */}
                                    <View style={{ flexWrap: 'wrap', flexDirection: 'row', }}>
                                        {this.state.hashTag.map((item, i) =>
                                            <View style={styles.hashTagView} key={i}>
                                                <Text style={template.contentText}>#{item}</Text>
                                                <TouchableOpacity onPress={() => this.hashTagRemove(i)}>
                                                    <IconPopup name="close" size={15} color="black" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>

                                    {/* 상세내용*/}
                                    <View style={[template.roundedBox, { backgroundColor: colors.white, borderColor: colors.medium }]}>
                                        <TextInput
                                            style={[template.inputText, { height: 100 }]}
                                            multiline={true}
                                            onChangeText={(value) => this.setState({ editSpec: value })}
                                        >{this.state.editSpec}</TextInput>
                                    </View>
                                </View>

                            </View>}
                    </ScrollView>


                    {/*판매자 가격 표시*/}
                    {!this.state.editGoodsViewVisible && this.state.editVisible &&
                        <View style={[styles.BottomView, { backgroundColor: colors.light }]}>
                            <Text style={[template.titleText, { fontSize: 23 }]}>{renderPrice}원</Text>
                        </View>}

                    <View style={styles.BottomView}>
                        {/*판매자 버튼*/}
                        {this.state.editVisible && !this.state.editGoodsViewVisible &&
                            <View style={{ width: "100%", flexDirection: 'row', }}>
                                <View style={{ flex: 1 }}>

                                    <TouchableOpacity style={styles.editButton} onPress={this.editButtonClicked} >
                                        <Image
                                            style={{ width: 18, height: 18 }}
                                            source={
                                                require('../../images/icon/edit-icon/edit.png')
                                            }
                                        />
                                        <Text style={[template.contentText, { color: colors.white }]}>  수정</Text>
                                    </TouchableOpacity >
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.red }]} onPress={this.removeButtonClicked}>
                                        <Image
                                            style={{ width: 18, height: 18 }}
                                            source={
                                                require('../../images/icon/edit-icon/delete.png')
                                            }
                                        />
                                        <Text style={[template.contentText, { color: colors.white }]}>   삭제</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    {this.state.item.valid == 1 &&
                                        <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.dark }]} onPress={this.goodsDisableButtonClicked}>
                                            <Image
                                                style={{ width: 18, height: 18 }}
                                                source={
                                                    require('../../images/icon/edit-icon/hide.png')
                                                }
                                            />
                                            <Text style={[template.contentText, { color: colors.white }]}>   숨김</Text>
                                        </TouchableOpacity>}
                                    {this.state.item.valid == 0 &&
                                        <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.dark }]} onPress={this.goodsEnableButtonClicked}>
                                            <Image
                                                style={{ width: 18, height: 18 }}
                                                source={
                                                    require('../../images/icon/edit-icon/hide.png')
                                                }
                                            />
                                            <Text style={[template.contentText, { color: colors.white }]}>  숨김해제</Text>
                                        </TouchableOpacity>}
                                </View>
                            </View>
                        }
                        {/*구매자 버튼*/}
                        {(this.state.buyVisible && this.state.quantity != 0 && this.state.item.removeFlag == 0 && this.state.item.valid == 1) &&
                            <View style={{ width: "100%", flexDirection: 'row', }}>
                                <View style={styles.pick_view}>
                                    <TouchableOpacity style={[styles.pick_button, { width: "100%", height: "100%" }]} onPress={this.dipsButtonClicked}>
                                        {this.state.dipsbuttonclicked ? <Image
                                            style={{ width: 20, height: 18 }}
                                            source={
                                                require('../../images/icon/heart-icon/heart_full.png')
                                            }
                                        /> : <Image
                                            style={{ width: 20, height: 18 }}
                                            source={
                                                require('../../images/icon/heart-icon/heart_empty.png')
                                            }

                                        />}

                                    </TouchableOpacity>
                                </View>
                                <View style={styles.price_view}>
                                    <Text style={{ fontSize: 23, fontWeight: 'bold', color: colors.main }}>{renderPrice}<Text style={[styles.detailUnit_text, { color: 'blue' }]}>원</Text></Text>
                                </View>
                                <View style={styles.buy_view}>

                                    <TouchableOpacity style={styles.buy_button} onPress={this.buyButtonClicked} activeOpacity={0.8}>
                                        <Text style={template.buttonText}>구매하기</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }

                        {/* 수정완료 버튼 */}
                        {this.state.editGoodsViewVisible &&
                            <View style={{ width: "100%" }}>
                                {this.state.validForm ?
                                    (<TouchableOpacity style={template.activeButton} onPress={this.editCompleteButtonClicked} >
                                        <Text style={template.buttonText}>수정완료</Text>
                                    </TouchableOpacity>)
                                    : (<TouchableOpacity style={template.inActiveButton}>
                                        <Text style={[template.buttonText, { color: colors.medium }]}>수정완료</Text>
                                    </TouchableOpacity>)}
                            </View>
                        }
                    </View>
                </View>
            </View>
        )
    }
}

class ImageView extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            imageSource: null,
        };
    }

    componentDidMount() {
        this.setState({ imageSource: this.props.image });
    }

    render() {
        return (
            <TouchableOpacity onPress={(index) => this.props.handleModal(this.props.index)}>
                <Image
                    source={{ uri: this.state.imageSource }}
                    style={styles.goods_image}
                />
            </TouchableOpacity>
        );
    }
}

class ImageModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            imageSource: null,
        };
    }

    componentDidMount() {
        this.setState({ imageSource: this.props.image });
    }

    render() {
        return (
            <View style={{ marginBottom: 10, alignItems: "center" }}>
                <Image
                    source={{ uri: this.state.imageSource }}
                    style={styles.goods_modal_image}
                />
            </View>
        );
    }
}