import React, { Component, PureComponent } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, FlatList, StyleSheet, Keyboard, Modal } from 'react-native';

import { styles } from "../../styles/mypage";
import { template, colors } from "../../styles/template/page_style";

import EmptyIcon from 'react-native-vector-icons/SimpleLineIcons';
import PageIcon from 'react-native-vector-icons/AntDesign'
import WebServiceManager from '../../util/webservice_manager';
import Indicator from '../../util/indicator';
import Constant from '../../util/constatnt_variables';

class SearchAddress extends Component {
    constructor(props) {
        super(props);
        this.countPerPage = 10; // 한 페이지 당 보여지는 개수
        this.state = {
            addressContents: [],
            searchText: "",
            searchViewVisible: false, // 검색했을 경우 보여지는 View on/off
            emptyListViewVisible: false, // 결과가 없을 때 View on/off
            page: 1,
            totalCount: 0, // 검색결과 총 개수
            indicator: false,
        }
    }

    //검색 버튼을 눌렀을 때
    searchAddress = () => {
        if (this.state.searchText == "") {
            alert("주소를 입력해주세요");
        }
        else {
            this.setState({ page: 1 }, () => this.goGetAddress())
            Keyboard.dismiss();
        }
    }
    goGetAddress = () => {
        this.callGetAddressAPI().then((response) => {
            console.log(response)
            if (response.results.common.errorMessage == "정상") {
                this.setState({ indicator: true })
                this.setState({
                    addressContents: response.results.juso, /* commonContents: response.results.common, */
                    totalCount: response.results.common.totalCount,
                    indicator: false,
                    searchViewVisible: true,
                    emptyListViewVisible: false
                }, () => {
                    if (this.state.addressContents.length == 0) {
                        this.setState({ emptyListViewVisible: true })
                    }
                });
            }
            else {
                alert(response.results.common.errorMessage);
            }

        });
    }

    // 이전 페이지 버튼 클릭
    pageDownClicked = () => {
        if (this.state.page > 1)
            this.setState({ page: this.state.page - 1 }, () => this.goGetAddress())
    }
    // 다음 페이지 버튼 클릭
    pageUpClicked = () => {
        if (this.state.page < (this.state.totalCount / this.countPerPage))
            this.setState({ page: this.state.page + 1 }, () => this.goGetAddress())
    }
    async callGetAddressAPI(page) {
        let manager = new WebServiceManager("https://business.juso.go.kr/addrlink/addrLinkApi.do?confmKey=" + Constant.addressSearchApiKey + "&currentPage=" + this.state.page + "&countPerPage=" + this.countPerPage + "&keyword=" + this.state.searchText + "&resultType=json");
        let response = await manager.start();
        if (response.ok)
            return response.json();
        else
            Promise.reject(response);
    }
    render() {
        return (
            <View style={styles.sub_background}>

                <View style={[styles.container, styles.center]}>
                    <TextInput
                        onChangeText={(text) => this.setState({ searchText: text })}
                        onEndEditing={this.searchAddress}
                        placeholder="도로명 또는 지번을 입력하세요."
                        style={inStyle.searchInput}
                        placeholderTextColor="light grey" />
                    <TouchableOpacity style={styles.search_btn} onPress={this.searchAddress}>
                        <Image
                            source={
                                require('../../images/icon/mypage/search.png')
                            }
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <Modal transparent={true} visible={this.state.indicator}>
                        <Indicator />
                    </Modal>
                    {/*    초기화면 */}
                    {this.state.searchViewVisible == false &&
                        <View style={inStyle.firstbackground}>
                            <Text style={inStyle.largeText}>우편번호 통합검색 TIP</Text>
                            <View style={{ marginTop: 5 }}>
                                <Text style={[inStyle.content]}>도로명 + 건물번호 (예: 테헤란로 152)</Text>
                                <Text style={[inStyle.content]}>동/읍/면/리 + 번지 (예: 역삼동 737)</Text>
                                <Text style={[inStyle.content]}>건물명, 아파트명 (예: 삼성동 힐스테이트)</Text>
                            </View>
                        </View>}

                    {/* 검색결과가 없을 때 */}
                    {this.state.emptyListViewVisible &&
                        <View style={styles.center}>
                            <EmptyIcon name="exclamation" size={40} color="#D1D1D1" />
                            <Text style={{ marginTop: 5 }}>검색 결과가 없습니다</Text>
                        </View>}


                    {/* 검색결과 리스트 */}

                    {this.state.searchViewVisible && this.state.emptyListViewVisible == false &&
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={this.state.addressContents}
                            renderItem={({ item, index }) => <AddressItem item={item} navigation={this.props.navigation} addressListener={this.props.route.params.addressListener} />} />
                    }

                </View>

                {/* 페이지 부분 */}
                {this.state.searchViewVisible && this.state.emptyListViewVisible == false &&
                    <View style={styles.page_view}>
                        <View style={styles.item2}>
                            <TouchableOpacity onPress={this.pageDownClicked} activeOpacity={0.8} >
                                <PageIcon name="leftsquareo" size={30} color="light grey" />
                            </TouchableOpacity>

                            <Text >
                                <Text style={[{ color: 'blue' }]}>{this.state.page} </Text> / {Math.ceil(this.state.totalCount / this.countPerPage)}   </Text>
                            <TouchableOpacity onPress={this.pageUpClicked} activeOpacity={0.8}>
                                <PageIcon name="rightsquareo" size={30} color="light grey" />
                            </TouchableOpacity>
                        </View>
                    </View>}
            </View>
        );
    }
}

class AddressItem extends PureComponent {
    constructor(props) {
        super(props);
    }
    addressItemClicked = (zipNo, roadAddr) => {
        this.props.navigation.navigate('Payment');
        this.props.addressListener(zipNo, roadAddr);
    }
    render() {
        const { zipNo, roadAddr, jibunAddr } = this.props.item;
        return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => this.addressItemClicked(zipNo, roadAddr)}>
                <View style={[styles.outputStyle]}>
                    <View style={[styles.outputStyle_sub]}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={inStyle.namecontent}>도로명</Text>
                            <Text style={[inStyle.content, { color: colors.black }]}>{roadAddr}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={inStyle.namecontent}>지번</Text>
                            <Text style={[inStyle.content, { color: colors.black }]}>{jibunAddr}</Text>
                        </View>
                    </View>

                    <View style={[styles.center, inStyle.namecontent]}>
                        <Text style={inStyle.zipNo}>{zipNo}</Text>
                    </View>
                </View>

            </TouchableOpacity>
        );
    }
}
export default SearchAddress;

const inStyle = StyleSheet.create({

    namecontent: [styles.content, { width: '20%' }],
    content: [styles.content, { width: '70%' }],
    searchInput: [template.roundedBox, styles.input, styles.content, { width: '90%', paddingLeft: 15 }],
    zipNo: [styles.name_text, { marginLeft: 10 }],
    firstbackground: [styles.container, { width: '100%', marginLeft: 45, marginTop: 5 }],
    largeText: [template.largeText, { fontWeight: 'bold' }],

}); 