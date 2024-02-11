import React, { Component } from 'react';
import {
    Text, View, TouchableOpacity, TextInput, ScrollView, Image, Alert, Keyboard,
    StyleSheet, Dimensions
} from 'react-native';

import { template, colors } from "../styles/template/page_style";

import IconCamera from 'react-native-vector-icons/Entypo';
import IconDelete from 'react-native-vector-icons/Ionicons';

import Constant from "../util/constatnt_variables";
import WebServiceManager from "../util/webservice_manager";
import ImageSelectorPopup from '../util/popup_image_selector';
import IndicatorText from '../util/indicator_text';
import Indicator from '../util/indicator';


class SignUp extends Component {

    constructor(props) {
        super(props);
        this.passwordRef = React.createRef();
        this.passwordokRef = React.createRef();
        this.registerCameraIcon = React.createRef();
        this.photoCameraIcon = React.createRef();

        this.modalRegisterCameraX = null;
        this.modalRegisterCameraY = null;
        this.modalPhotoCameraX = null;
        this.modalPhotoCameraY = null;

        this.state = {
            companyNo: '',
            companyAddress: '',
            companyName: '',
            passwd: '',
            passwordok: '',

            companyImageURI: '',
            nameCardImageURI: '',

            companyPopupMenuVisible: false,  //사업자등록증 선택을 위한 팝업 on/off (카메라/갤러리)
            cardPopupMenuVisible: false,   //명함 선택을 위한 팝업 on/off (카메라/갤러리)
            registerButtonVisible: false, //로그인 버튼 활성화 on/off  

            textIndicator: false,                 //이미지 분석중이란 textIndicator 표시 여부 on/off
            barIndicator: false                  //회원가입중 barIndicator 표시 여부 on/off            
        }
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        //BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    }

    //이미지를 업로드하기 위한 포맷으로 변환
    makeBinaryData() {
        let imageData = [];
        //사업자등록증 이미지
        const companyImageData = {
            uri: this.state.companyImageURI,
            type: "image/jpeg",
            name: 'photo.jpg',
        }
        imageData.push(companyImageData);
        //명함 이미지
        const cardImageData = {
            uri: this.state.nameCardImageURI,
            type: "image/jpeg",
            name: 'photo.jpg',
        }
        imageData.push(cardImageData);
        return imageData;
    }

    goAddUser = () => {
        if (this.state.passwd !== this.state.passwordok) {
            Alert.alert("비밀번호가 일치하지 않습니다");
        }
        else {
            this.setState({ barIndicator: true });
            this.callAddUserAPI().then((response) => {
                console.log(response);
                this.setState({ barIndicator: false });
                if (response.success == 0) {
                    Alert.alert("이미 있는 사업자번호입니다");
                }
                else if (response.success == -1) {
                    Alert.alert("서버 오류로 회원가입에 실패했습니다.");
                }
                else {
                    Alert.alert('가입 신청 완료', '입력 된 내용 확인 후 승인이 완료됩니다.', [
                        { text: '확인', onPress: () => { this.props.navigation.navigate("Login") } },
                    ]);
                    //this.setState({ modal: this.state.modal ? false : true }); //신청대기 모달
                }
            })
        }
    }


    //사업자 등록증 이미지, 명함 이미지, 사업자등록 번호, 패스워드, 사업자 주소, 이름을 서버로 전송하여 사용자 추가 요청
    //서버에서 사업자 주소를 이용하여 위경도 값 추출하여 DB에 저장
    async callAddUserAPI() {
        const userData = {
            companyNo: this.state.companyNo.replace(/-/g, ''),
            companyName: this.state.companyName,
            companyAddress: this.state.companyAddress,
            passwd: this.state.passwd
        };
        const imageData = this.makeBinaryData();

        let manager = new WebServiceManager(Constant.serviceURL + "/AddUser", "post");
        manager.addFormData("data", userData);
        manager.addBinaryData("file1", imageData[0]); //사업자 등록증 이미지
        manager.addBinaryData("file2", imageData[1]); //명함 이미지

        console.log(userData);
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }


    //사업자등록증 이미지 클릭시 (카메라/갤러리 선택 팝업메뉴 띄움)
    companyImageClicked = () => {
        this.setState({ companyPopupMenuVisible: true })
    }

    //명함 이미지 버튼 클릭 (카메라/갤러리 선택 팝업메뉴 띄움)
    nameCardImageClicked = () => {
        this.setState({ cardPopupMenuVisible: true })
    }

    //사업자 등록증 이미지 선택을 위한 카메라로 이동
    goCompanyCameraScreen = () => {
        this.setState({ companyPopupMenuVisible: false });
        this.props.navigation.navigate('SignUpCamera', { onResultListener: this.companyImageInfo, cutImageStyle: "company" });
    }

    //사업자 등록증 이미지 선택을 위한 갤러리로 이동
    goCompanyGalleryScreen = () => {
        this.setState({ companyPopupMenuVisible: false });
        //this.props.navigation.navigate('Gallery', { companyImageInfoListener:this.companyImageInfo })
        this.props.navigation.navigate('SignUpGallery', { onResultListener: this.companyImageInfo });
    }

    // 명함 이미지 선택을 위한 카메라로 이동
    goNamecardCameraScreen = () => {
        this.setState({ cardPopupMenuVisible: false });
        this.props.navigation.navigate('SignUpCamera', { onResultListener: this.cardImageInfo, cutImageStyle: "nameCard" });
    }
    // 명함 이미지 선택을 위한 갤러리로 이동
    goNamecardGalleryScreen = () => {
        this.setState({ cardPopupMenuVisible: false });
        this.props.navigation.navigate('SignUpGallery', { onResultListener: this.cardImageInfo });
    }


    // CompanyGallery 페이지에서는 이미지 uri만 가져와서 이미지 분석하고 결과 가져옴
    companyImageInfo = (imageURI) => {
        this.setState({ companyImageURI: imageURI });
        const fileData = {
            uri: imageURI,
            type: "image/jpeg",
            name: 'photo.jpg',
        }

        this.setState({ textIndicator: true });
        this.callCompanyInfoAPI(fileData).then((response) => {
            this.setState({ textIndicator: false });
            console.log("company info", response);
            if (response.success == 0) {
                Alert.alert('사업자 인식', '사업자 등록번호를 인식하지 못했습니다. 직접 입력하세요', [
                    { text: '확인', onPress: () => { this.setState({ companyNo: "", companyName: "", companyAddress: "" }) } }]);
            }
            else
                this.setState({ companyNo: response.no, companyName: response.name, companyAddress: response.address });
            this.onValueChange();
        });
    }

    //사업자 등록증 이미지로 텍스트 분석하여 상호, 사업자번호, 소재지 가져오기 
    async callCompanyInfoAPI(imageData) {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetCompanyInfo", "post");
        manager.addBinaryData("file", imageData);
        let response = await manager.start();
        if (response.ok) {
            return response.json();
        }
    }



    //카메라 또는 갤러리에서 선택된 명함 이미지 URI
    cardImageInfo = (imageURI) => {
        console.log('sign up namecard image uri', imageURI);
        this.setState({ nameCardImageURI: imageURI });
        this.onValueChange();
    }

    //사업자 등록증 이미지 삭제시
    companyImageRemoveClicked = () => {
        this.setState({ companyImageURI: "", companyNo: "" });
        this.onValueChange();
    }

    //명함 이미지 삭제시
    nameCardImageRemoveClicked = () => {
        this.setState({ nameCardImageURI: "" });
        this.onValueChange();
    }

    onValueChange = (value) => {
        this.setState(value, () => {
            let isValidForm = true;

            if (this.state.companyNo.trim().replaceAll("-", "").length < 10) // 조건 필요시 추가
                isValidForm = false;
            if (this.state.passwd.trim().length == 0)
                isValidForm = false;
            if (this.state.passwordok.trim().length == 0)
                isValidForm = false;
            if (this.state.companyImageURI == "")
                isValidForm = false;
            if (this.state.nameCardImageURI == "")
                isValidForm = false;

            console.log("isValidForm", isValidForm);
            this.setState({ registerButtonVisible: isValidForm });
        });
    }

    getViewSize = (event) => {
        this.registerCameraIcon.current.measure((fx, fy, width, height, px, py) => {
            this.modalRegisterCameraX = px + width - (width);
            this.modalRegisterCameraY = py + height - (height / 10);
            //console.log('location:',fx,fy,width,height,px,py)
        })

        this.photoCameraIcon.current.measure((fx, fy, width, height, px, py) => {
            this.modalPhotoCameraX = px + width - (width);
            this.modalPhotoCameraY = py + height - (height / 10);
            // console.log('location:',fx,fy,width,height,px,py)
        })
    }

    keyboardDidShow = () => {
        console.log('Keyboard Shown');
    }

    keyboardDidHide = () => {
        console.log('Keyboard Hide');
        this.onValueChange();
    }

    render() {
        return (
            <>
                <View style={template.baseContainer}>
                    <ScrollView onScroll={event => { this.getViewSize(event) }}>
                        <View style={inStyle.container}>
                            <View style={inStyle.headerVew}>
                                <Text style={[template.contentText,{color:colors.dark, marginBottom:'1%'}]}>서비스 이용을 위해 아래의 항목을 첨부해주세요.</Text>
                                <Text style={[template.contentText,{color:colors.dark}]}>등록한 사업자 등록증과 명함 확인 후 승인이 완료됩니다.</Text>
                            </View>
                            <View style={inStyle.buttonView}>
                                <View style={{  alignItems: 'center',justifyContent: 'center',}}>
                                    <Text style={[template.contentText, { marginBottom: '3%' }]}>사업자 등록증</Text>

                                    <View onLayout={(event) => { this.getViewSize(event) }} ref={this.registerCameraIcon}>
                                        {this.state.companyImageURI == "" ?
                                            (<TouchableOpacity style={inStyle.roundedButton} onPress={() => this.setState({ companyPopupMenuVisible: true })}>
                                                <Image
                                                    style={{ width: 32, height: 44 }}
                                                    source={
                                                        require('../images/icon/register-icon/companyImage.png')
                                                    }
                                                />
                                            </TouchableOpacity>) :
                                            (<TouchableOpacity style={inStyle.roundedButton}>
                                                <Image source={{ uri: this.state.companyImageURI }} style={inStyle.roundedButton} />
                                                <TouchableOpacity style={inStyle.deleteButtonView} onPress={this.companyImageRemoveClicked}>
                                                    <IconDelete name="close-circle" color="black" size={27}></IconDelete>
                                                </TouchableOpacity>
                                            </TouchableOpacity>)
                                        }
                                    </View>
                                </View>
                                <View style={{  alignItems: 'center',justifyContent: 'center',}}>
                                    <Text style={[template.contentText, { marginBottom: '3%' }]}>명함</Text>

                                    <View onLayout={(event) => { this.getViewSize(event) }} ref={this.photoCameraIcon}>
                                        {this.state.nameCardImageURI == "" ?
                                            (<TouchableOpacity style={inStyle.roundedButton} onPress={() => this.setState({ cardPopupMenuVisible: true })}>
                                                <Image
                                                    style={{ width: 42, height: 26 }}
                                                    source={
                                                        require('../images/icon/register-icon/nameCard.png')
                                                    }
                                                />
                                            </TouchableOpacity>) :
                                            (<TouchableOpacity style={inStyle.roundedButton}>
                                                <Image source={{ uri: this.state.nameCardImageURI }} style={inStyle.roundedButton} />
                                                <TouchableOpacity style={inStyle.deleteButtonView} onPress={this.nameCardImageRemoveClicked}>
                                                    <IconDelete name="close-circle" color="black" size={27}></IconDelete>
                                                </TouchableOpacity>
                                            </TouchableOpacity>)}
                                    </View>
                                </View>
                            </View>

                            <View style={inStyle.textInputView}>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>사업자 등록번호</Text>
                                <View style={template.textInput}>
                                    <TextInput
                                        ref={(c) => { this.regnumRef = c; }}
                                        returnKeyType="next"
                                        onSubmitEditing={() => { this.passwordRef.focus(); }}
                                        onChangeText={(value) => this.onValueChange({ companyNo: value.replace(/(\d{3})(\d{2})(\d)/, "$1-$2-$3") })}
                                        value={this.state.companyNo}
                                    />
                                </View>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>비밀번호</Text>
                                <View style={template.textInput}>

                                    <TextInput
                                        ref={(c) => { this.passwordRef = c; }}
                                        returnKeyType="next"
                                        onSubmitEditing={() => { this.passwordokRef.focus(); }}
                                        onChangeText={(value) => this.onValueChange({ passwd: value })}
                                        secureTextEntry={true}
                                        value={this.state.passwd}
                                    />
                                </View>
                                <Text style={[template.contentText, { color: colors.dark, marginBottom: '2%' }]}>비밀번호 확인</Text>
                                <View style={template.textInput}>

                                    <TextInput
                                        ref={(c) => { this.passwordokRef = c; }}
                                        returnKeyType="next"
                                        onChangeText={(value) => this.onValueChange({ passwordok: value })}
                                        secureTextEntry={true}
                                        value={this.state.passwordok}
                                    />
                                </View>
                            </View>
                        </View>

                        {/*모달들 */}
                        {/*사업자등록증 이미지 선택 팝업 메뉴 모달*/}
                        {this.state.companyPopupMenuVisible &&
                            <ImageSelectorPopup x={this.modalRegisterCameraX} y={this.modalRegisterCameraY}
                                closeCameraPopupMenu={() => this.setState({ companyPopupMenuVisible: false })}
                                goCameraScreen={this.goCompanyCameraScreen}
                                goGalleryScreen={this.goCompanyGalleryScreen} />}


                        {/*명함 이미지 선택 팝업 메뉴 모달*/}
                        {this.state.cardPopupMenuVisible &&
                            <ImageSelectorPopup x={this.modalPhotoCameraX} y={this.modalPhotoCameraY}
                                closeCameraPopupMenu={() => this.setState({ cardPopupMenuVisible: false })}
                                goCameraScreen={this.goNamecardCameraScreen}
                                goGalleryScreen={this.goNamecardGalleryScreen} />}

                        {/*이미지 분석중 Indicator모달*/}
                        {this.state.textIndicator && <IndicatorText text="사업자 등록증을 분석중입니다." />}
                        {/*회원가입중중 Indicator 모달*/}
                        {this.state.barIndicator && <Indicator />}

                    </ScrollView>
                    {this.state.registerButtonVisible ?
                        (<TouchableOpacity activeOpacity={0.8} style={template.activeButton} onPress={this.goAddUser}>
                            <Text style={template.buttonText}>회원가입 신청</Text></TouchableOpacity>)
                        : (<TouchableOpacity activeOpacity={0.8} style={template.inActiveButton}>
                            <Text style={[template.buttonText,{color:colors.medium}]}>회원가입 신청</Text>
                        </TouchableOpacity>)}
                </View>
            </>
        )
    }
}


export default SignUp;


const ScreenHeight = Dimensions.get('window').height;
const ScreenWidth = Dimensions.get('window').width;
const inStyle = StyleSheet.create({
    roundedButton: [
        template.roundedButton, {
            width: ScreenWidth / 4,
            height: ScreenWidth / 4,
            backgroundColor: colors.white,
            borderRadius: 20,
            marginHorizontal: '10%',
            shadowColor: "black",
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 5,
        }
    ],
    container:{
        flex: 1,
        paddingTop:'5%',
       paddingHorizontal:'7%',
    },
    headerVew:{
        flex: 1,
        paddingBottom:'5%',
        justifyContent:'center',
        alignItems:'center',
    },
    deleteButtonView:{
        top: -15,
        right: -15,
        position: 'absolute',
    },
    buttonView:{
       height:ScreenHeight/3,
        flexDirection: 'row',
        alignContent:'center',
        justifyContent:'center', 
    },
    textInputView:{
        height:ScreenHeight/3,
    }
})