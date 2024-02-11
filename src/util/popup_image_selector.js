import React, { Component } from 'react';
import { Text, View, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet, Image } from 'react-native';
import { template, colors } from "../styles/template/page_style";
import IconPopup from 'react-native-vector-icons/EvilIcons';

//이미지 선택 버튼 클릭시 팝업 (카메라, 갤러리)
export default class ImageSelectorPopup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const layout = { flex: 1, left: this.props.x-10, top: this.props.y-40 };
        return (
            <Modal
                animationType='fade'
                transparent={true}
                visible={true}
                onRequestClose={this.props.closeCameraPopupMenu}>
                <TouchableOpacity onPress={this.props.closeCameraPopupMenu} style={{ flex: 1 }}>
                    <View style={layout} >
                        <TouchableWithoutFeedback>
                            <View>
                                <TouchableOpacity onPress={this.props.goCameraScreen} style={inStyle.cameraButton}>
                                    <View style={{ flexDirection: 'row', alignItems:'center'}}>
                                        <Image
                                            style={{ width: 20, height: 14 }}
                                            source={
                                                require('../images/camera/camera.png')
                                            }
                                        />
                                        <Text style={[template.contentText,{fontWeight:'500',marginLeft:'4%'}]}>카메라   </Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.props.goGalleryScreen} style={inStyle.galleryButton}>
                                    <View style={{ flexDirection: 'row' , alignItems:'center'}}>
                                        <Image
                                            style={{ width: 20, height: 17.17 }}
                                            source={
                                                require('../images/gallery/gallery.png')
                                            }
                                        />
                                        <Text style={[template.contentText,{fontWeight:'500',marginLeft:'4%'}]}>앨범</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableOpacity>
            </Modal>
        )
    }
}

const inStyle = StyleSheet.create({
   
    cameraButton: {
        width:80,
        height:40,
        paddingHorizontal:'2%',
        backgroundColor:colors.light,
        justifyContent: 'center',
        marginBottom:'1%',
        shadowColor: "black",
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 5,
    },
    galleryButton: {
        width:80,
        height:40,
        paddingHorizontal:'2%',
        backgroundColor:colors.light,
        justifyContent: 'center',
        shadowColor: "black",
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 5,
    },

    btn_text: {
        fontFamily: "Cochin",
        fontSize: 16,
        color: "white",
        alignItems: 'center',
    }
});