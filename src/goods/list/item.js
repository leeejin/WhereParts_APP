import React, { Component, PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';

import { template, colors } from '../../styles/template/page_style';

import Constant from '../../util/constatnt_variables';
import WebServiceManager from '../../util/webservice_manager';
import FunctionUtil from '../../util/libraries_function';


import MapIcon2 from 'react-native-vector-icons/FontAwesome5';


export default class ListItem extends PureComponent {
    constructor(props) {
        super(props);

        this.item = this.props.item;
        this.state = {
            imageURI: null,
            isDetailViewModal: false,
        };
    }

    componentDidMount() {
        this.callGetGoodsImageAPI().then((response) => {
            let reader = new FileReader();
            reader.readAsDataURL(response); //blob을 읽어줌 읽은 놈이 reader
            reader.onloadend = () => {
                this.setState({ imageURI: reader.result }) //base64를 imageURI에 집어넣어준다

            } //끝까지 다 읽었으면 
        });
    }
    async callGetGoodsImageAPI() {
        let manager = new WebServiceManager(Constant.serviceURL + "/GetGoodsImage?id=" + this.item.id + "&position=1");
        let response = await manager.start();
        if (response.ok)
            return response.blob();
    }

    goGoodsDetailScreen = () => {
        this.props.navigation.push('GoodsDetail', { goodsID: this.item.id, sellerID: this.item.userID, refresh: this.props.refreshListener });
    }

    //부품번호에 대한 Goodle 검색창 보이기(Web View)
    goGoodsNumberWebView = () => {
        this.props.navigation.navigate('GoogleWebView', { url: 'http://www.google.com/search?q=' + this.item.number });
    }

    render() {
        const item = this.props.item;
        return (
            <TouchableOpacity onPress={this.goGoodsDetailScreen}>
                <View style={inStyle.itemView}>
                    <View style={template.layoutBox}>
                        <View style={{ alignItems: 'flex-start' }}>
                            <Text style={template.itemNameText}>{item.name.length > 13 ? `${item.name.slice(0, 11)}...` : item.name}</Text>
                        </View>
                    </View>
                    <View style={[template.layoutBox, { flexDirection: 'row' }]}>
                        <Image
                            source={{ uri: this.state.imageURI }}
                            style={template.imageView} />
                        <View style={inStyle.itemInfoView}>
                            <Text style={template.itemDistanceText}><MapIcon2 name='map-marker' color={colors.dark} size={10}></MapIcon2>  {item.distance}km</Text>
                            <TouchableOpacity onPress={this.goGoodsNumberWebView}>
                                <Text style={template.itemNumberText}>{item.number.length > 10 ? `${item.number.slice(0, 10)}...` : item.number}</Text>
                            </TouchableOpacity>
                            <Text style={template.itemPriceText}>{FunctionUtil.getPrice(item.price)}{"원"}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
const ScreenHeight = Dimensions.get('window').height;
const ScreenWidth = Dimensions.get('window').width;

const inStyle = StyleSheet.create({
    itemView: [
        template.roundedBox,
        {
            width: ScreenWidth / 2.2,
            marginLeft: (ScreenWidth - (2 * ScreenWidth / 2.2)) / 3,
            marginVertical: '5%',
        }
    ],
    itemInfoView: [
        template.layoutBox,
        {
            flex: 1,
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
        }
    ]

})