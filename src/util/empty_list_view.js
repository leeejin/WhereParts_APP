import React, { Component } from 'react';
import { View, Text, ScrollView, RefreshControl, Image, StyleSheet, Dimensions } from 'react-native';

import { template, colors } from "../styles/template/page_style";
import EmptyListIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class EmptyListView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                {this.props.hasOwnProperty('contentContainerStyle') && (<ScrollView
                    style={{ borderWidth: 0, paddingTop: "15%" }}
                    refreshControl={<RefreshControl refreshing={this.props.isRefresh} onRefresh={this.props.onRefreshListener} />}
                    contentContainerStyle={this.props.contentContainerStyle}
                >
                    <View style={inStyle.iconView}>
                        <Image
                            style={{ width: 127, height: 62 }}
                            source={
                                require('../images/icon/empty-icon/empty.png')
                            }
                        />
                        <Text style={[template.buttonText, { color: colors.black, marginTop: 10 }]}>항목이 없습니다</Text>
                    </View>

                </ScrollView>)}

                {this.props.hasOwnProperty('contentContainerStyle') == false && (<ScrollView
                    style={{ borderWidth: 0, paddingTop: "15%", }}
                    refreshControl={<RefreshControl refreshing={this.props.isRefresh} onRefresh={this.props.onRefreshListener} />}
                >
                    <View style={inStyle.iconView}>
                        <Image
                            style={{ width: 127, height: 62 }}
                            source={
                                require('../images/icon/empty-icon/empty.png')
                            }
                        />
                        <Text style={[template.buttonText, { color: colors.black, marginTop: 10 }]}>항목이 없습니다</Text>
                    </View>
                </ScrollView>)}
            </>
        );
    }
}
const ScreenHeight = Dimensions.get('window').height;
const ScreenWidth = Dimensions.get('window').width;

const inStyle = StyleSheet.create({
    iconView: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.light,
        width: ScreenWidth / 1.5,
        height: ScreenWidth / 1.5,
        borderRadius: 200,
        alignSelf: 'center'
    }

}); 