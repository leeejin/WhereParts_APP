import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, NativeModules, FlatList, BackHandler, Image, Dimensions, View, Text, TouchableWithoutFeedbackBase } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { RadioGroup } from 'react-native-radio-buttons-group';

import folder from '../images/gallery/folder.png';
import { shouldUseActivityState } from 'react-native-screens';

//안드로이드 native에서 만든 앨범 Module을 이용하여 앨범의 URI을 가져옴
//전체 이미지의 URI를 모두 가져오는 경우와
//폴더별로 저장된 이미지 URI를 가져오는 경우로 구분
//this.state.group가 true일 경우 폴더별로 가져옴
export default class GalleryX extends Component {
    constructor(props) {
        super(props);
        this.selectedImageURIs = [];
        this.isSelectEnabled = true;
        this.isDeSelectEnabled = true;

        this.max = this.props.max;
        this.autoClose = this.props.autoClose;
        this.onResultListener = this.props.onResultListener;

        this.groupURIs = [];      //이미지가 저장된 폴더와 uri객체 배열
        this.totalImageURIs = []; //모든 이미지 URIs
        this.radioButtons = [     //사진/앨범 라디오 버튼 객체
            { id: '1', label: "사진", value: 0, size: 20 },
            { id: '2', label: "앨범", value: 1, size: 20 }
        ];

        console.log("max값", this.props.max);
        console.log("autoClose", this.props.autoClose);
        this.state = {
            imageURIs: [],       //화면에 보여줄 이미지 URIs
            imageLength: 0,      //현재 선택된 사진의 갯수
            groupNames: [],      //화면에 보여줄 이미지 폴더 이름들
            group: false,       //true: 폴더별로 보여줌, false: 이미지 전체를 보여줌
            albumType: "1"       //1: 모든사진이 선택됨, 2:앨범이 선택됨 이 값에 따라 라디오버튼 선택이 달라짐
        };
    }

    componentDidMount() {
        const { AlbumModule } = NativeModules;
        AlbumModule.getAlbumUris(this.imageFailedCallback, this.imageSuccessCallback);
        AlbumModule.getAlbumUrisGroup(this.albumFailedCallback, this.albumSuccessCallback);

        BackHandler.addEventListener("hardwareBackPress", this.backPressed); //뒤로가기 이벤트
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        console.log('gallery x back pressed');
        //this.setState({group:true});
        this.props.navigation.pop();
        return true;
    }

    //앨범에서 이미지 가져오기 실패시
    imageFailedCallback = (message) => {
        console.log('total image error', message);

    }

    albumFailedCallback = (message) => {
        console.log('group image error', message);
    }


    //전체 이미지 URI를 가져옴
    //[content://, content://]
    imageSuccessCallback = (uris) => {
        this.totalImageURIs = uris;
        this.setState({ imageURIs: uris });
    }

    //앨범별로 이미지를 가져옴
    //[{"Pictures":[content://....,content://....],{"my-album",[content://...,content://...]}]
    albumSuccessCallback = (uris) => {
        this.groupURIs = uris;
    }

    setAlbumType(value) {
        if (value == '1')
            this.setState({ group: false, albumType: value, imageURIs: [] }, () => {
                this.setState({ imageURIs: this.totalImageURIs });
            });
        else
            this.setState({ group: true, albumType: value, groupNames: [] }, () => {
                const groupNames = this.groupAlbumURIs();
                this.setState({ groupNames: groupNames });
            });
        //console.log('album type = ',value);
    }

    groupAlbumURIs() {
        const keys = Object.keys(this.groupURIs);
        let groupNames = [];
        for (var i = 0; i < keys.length; i++)
            groupNames = groupNames.concat(keys[i]);
        //console.log('album = ',groupNames);
        return groupNames;
    }

    //사진을 선택한 경우 (폴더별로 이미지를 볼 경우 첫번째 사진 선택은 상위 폴더로 이동)
    //상위 폴더로 갈 경우 state.group을 true로 함으로써 다시 폴더별로 이미지 봄
    onSelectListener = (uri) => {
        if (this.state.group == false && uri == "!folder") {
            this.setState({ group: true });
        }
        else {
            if (this.selectedImageURIs.length < this.max) {
                this.selectedImageURIs = this.selectedImageURIs.concat(uri);
            }
            if (this.selectedImageURIs.length == this.max) {
                this.isSelectEnabled = false;
                this.isDeSelectEnabled = true;
            }
            if (this.autoClose) {
                this.onResultListener(uri);
                this.props.navigation.pop();
            }
            this.setState({ imageLength: this.selectedImageURIs.length });
        }
    }

    //사진 선택을 해제한 경우
    onDeSelectListener = (uri) => {
        if (this.selectedImageURIs.length > 0) {
            this.selectedImageURIs = this.selectedImageURIs.filter((item) => {
                return item != uri;
            });
        }

        if (this.selectedImageURIs.length >= 0 && this.selectedImageURIs.length < this.max) {
            this.isSelectEnabled = true;
            this.isDeSelectEnabled = true;
        }
        this.setState({ imageLength: this.selectedImageURIs.length })
    }

    //선택완료 버튼을 클릭한 경우
    onSelectComplete = () => {
        //console.log('selected image URIs = ',this.selectedImageURIs);
        this.onResultListener(this.selectedImageURIs);
        this.props.navigation.pop();
    }

    //사진을 선택할 수 있는지 판단
    getSelectEnabled = () => {
        return this.isSelectEnabled;
    }

    //사진선택을 해제할 수 있는지 판단
    getDeSelectEnabled = () => {
        return this.isDeSelectEnabled;
    }


    //이미지 폴더명을 터치했을 경우
    //폴더안에 있는 이미지를 보여줌(state 변수인 group:false로 함으로써 ListItem 클래스가 실행되도록 함)
    //폴더안에 있는 이미지 배열의 첫번째 요소에 상위 폴더로 이동할 수 있는 이미지를 제일앞에 삽입하고 state.imageURIs에
    //폴더안에 있는 이미지들을 추가
    //state.imageURIs[0]는 "!folder"로 함
    onSelectGroupListener = (groupName) => {
        //console.log('selected group name =',groupName);
        //console.log('selected group image uris = ',this.groupURIs[groupName]);
        let imageURIsInGroup = ["!folder"];
        imageURIsInGroup = imageURIsInGroup.concat(this.groupURIs[groupName]);
        //console.log('selected group image uris = ',imageURIsInGroup);
        this.setState({ group: false, imageURIs: imageURIsInGroup });
    }


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerBar}>
                    {this.max != null &&
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={[styles.text, { fontSize: 15 }]}> {this.state.imageLength} / </Text>
                            <Text style={[styles.text, { fontSize: 15, color: 'black' }]}>{this.max}</Text>
                        </View>}
                    <RadioGroup layout="row" radioButtons={this.radioButtons} selectedId={this.state.albumType} onPress={(value) => this.setAlbumType(value)} />
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <TouchableOpacity  style={styles.buttonView} onPress={this.onSelectComplete}>
                            <Text style={{fontSize:16, color:'white'}}>확인</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* 앨범형태로 이미지를 볼 경우 앨범을 터치하면 state.froup=false 바뀌면서 아래 FlatList가 실행된*/}
                {this.state.group == true && (
                    <FlatList data={this.state.groupNames} horizontal={false} numColumns={2} renderItem={(item) => <GroupListItem item={item} itemSize={this.groupURIs[item.item].length} onSelectListener={(name) => this.onSelectGroupListener(name)} />} />
                )}
                {/* 전체 이미지를 볼 경우 */}
                {this.state.group == false && (
                    <FlatList data={this.state.imageURIs} horizontal={false} numColumns={3} renderItem={(item) => <ListItem selectedImageURIs={this.selectedImageURIs} item={item} onSelectListener={(index) => this.onSelectListener(index)} onDeSelectListener={(index) => this.onDeSelectListener(index)} getSelectEnabled={this.getSelectEnabled} getDeSelectEnabled={this.getDeSelectEnabled} />} />
                )}
            </SafeAreaView>
        );
    }
}


//전체 또는 폴더별로 이미지를 보여줌
class ListItem extends Component {
    constructor(props) {
        super(props);

        this.imageURI = this.props.item.item;
        this.isSelected = false;

        this.state = {
            checkBoxVisible: false
        };
    }

    //이미 선택되어 있는 이미지인지 체크하여 체크박스 표시
    componentDidMount() {
        if (this.props.selectedImageURIs.includes(this.imageURI)) {
            this.setState({ checkBoxVisible: true });
            this.isSelected = true;
        }
        //this.setState({imageSource:this.props.item.item});
    }

    //사진을 선택 또는 해제할 경우(상위 폴더를 클릭할 경우 이미지 선택 또는 해제하지 않고 상위 Listener실행)
    imageSelectHandler = () => {
        this.isSelected = !this.isSelected;
        if (this.imageURI == "!folder")
            this.props.onSelectListener(this.imageURI);
        else {
            if (this.props.getSelectEnabled() == true && this.isSelected == true) {
                this.props.onSelectListener(this.imageURI);
                this.setState({ checkBoxVisible: true });
            }
            else if (this.props.getDeSelectEnabled() == true && this.isSelected == false) {
                this.props.onDeSelectListener(this.imageURI);
                this.setState({ checkBoxVisible: false })
            }
            else
                this.setState({ checkBoxVisible: false });
        }
    }

    render() {
        return (
            <TouchableOpacity onPress={this.imageSelectHandler}>
                <View style={{ paddingTop: '3%', paddingLeft: '2%',  /*borderWidth:1*/ }}>
                    {this.imageURI == "!folder" && (
                        <>
                            <View style={styles.preFolderView}>
                                <Image
                                    style={{ width: 60, height: 54.26 }}
                                    source={
                                        require('../images/gallery/folder2.png')
                                    }
                                />
                                <Text style={{ textAlign: "center" }}>상위</Text>
                            </View>

                            
                        </>
                    )}
                    {this.imageURI != "!folder" && (
                        <Image source={{ uri: this.imageURI }} style={styles.image} />
                    )}
                </View>
                {/* 이미지 선택여부 CheckBox */}
                {this.state.checkBoxVisible && (
                    <View style={styles.overlay}>
                        <CheckBox tintColors={{ true: 'white', false: 'black' }} disabled={false} value={true} />
                    </View>
                )}
            </TouchableOpacity>
        );
    }
}


//이미지가 저장된 폴더를 보여줌(폴더를 터치하면 해당 폴더로 이동하여 위 ListItem을 보여줌)
//폴더를 터치하면 상위 클래스의 리스너를 호출
class GroupListItem extends Component {
    constructor(props) {
        super(props);
        console.log('group name = ', this.props.item);
        console.log('image size in group = ', this.props.itemSize);
    }

    onSelectGroup = (name) => {
        this.props.onSelectListener(name);
    }

    render() {
        return (
            <TouchableOpacity onPress={() => this.onSelectGroup(this.props.item.item)}>
                <View style={styles.folderView}>
                    <Image
                        style={{ width: 90, height: 77.26 }}
                        source={
                            require('../images/gallery/folder2.png')
                        }
                    />

                </View>
           
                <Text style={styles.folderName}>{this.props.item.item} ({this.props.itemSize})</Text>
            </TouchableOpacity>
        );
    }
}



const ScreenHeight = Dimensions.get('window').height;
const ScreenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
    container: {
        flex: 1,

        //marginTop: StatusBar.currentHeight || 0,
    },
    headerBar: {
        flexDirection: 'row',
        paddingHorizontal: '5%',
        paddingVertical: '2%',
    },
    image: {
        width: (ScreenWidth / 3.2),
        height: (ScreenWidth / 3.2),
        alignSelf: 'center',
        //marginHorizontal:"0.3%",
        //marginVertical:"0.5%",
        //borderRadius:15
    },
    text: {
        fontFamily: "Cochin",
        fontSize: 18,
        color: "#185FE0",
        //borderWidth:1,
        //alignItems: 'flex-end',
    },
    overlay: {
        position: "absolute",
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 5,
        paddingRight: 5,
        width: "100%",
        height: "100%",
        //backgroundColor : "rgba(0,0,0,0.6)",
        top: 0,
    },
    folderView: {
        borderRadius: 10,
        backgroundColor: '#F6F6F6',
        justifyContent: 'center',
        alignItems: 'center',
        width: ScreenWidth / 2.5,
        height: ScreenWidth / 2.5,
        marginLeft: (ScreenWidth - (2 * ScreenWidth / 2.5)) / 3,
        marginBottom: '2%'
    },
    preFolderView:{
        borderRadius: 10,
        backgroundColor: '#F6F6F6',
        justifyContent: 'center',
        alignItems: 'center',
        width: (ScreenWidth / 3.2),
        height: (ScreenWidth / 3.2),
    },
    folderName: {
        textAlign: "center",
        marginBottom: '6%',
        fontSize: 15,
        fontWeight: 'bold'
    },
    buttonView:{
        backgroundColor:'#185FE0',
        borderRadius:10,
        paddingHorizontal:'10%',
        paddingVertical:'3%'
    }
});