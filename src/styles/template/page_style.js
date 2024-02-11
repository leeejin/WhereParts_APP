import { StyleSheet, Dimensions } from 'react-native';
const ScreenHeight = Dimensions.get('window').height;
const ScreenWidth = Dimensions.get('window').width;

export const colors = {
    main: '#185FE0',
    main_light: '#00A1FF',
    main_dark: '#081866',
    //회색
    light: '#F6F6F6',
    medium: '#BCBCBC',
    dark: '#7A7A7A',
    red: '#FF3D51',
    white: '#FFFFFF',
    black: '#000000',
    line: '#E6E6E6',

}

export const template = StyleSheet.create({
    baseContainer: { //전체 컨테이너
        flex: 1,
        backgroundColor: colors.white,

    },
    container: { //선 없는 페이지 컨테이너
        flex: 1,
        paddingHorizontal: '4%',
    },
    //TextInput(2)
    textInput: {
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.medium,
        paddingHorizontal: '4%',
        height: 40,
        marginBottom: '3%',
    },
    textInput2: {
        borderWidth: 1,
        borderColor: colors.white,
        borderRadius: 20,
        height: 45,
        width: '85%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    //Line
    line: {
        borderWidth: 0.5,
        width: '100%',
        borderColor: colors.line
    },
    //Box
    lineBox: {
        paddingHorizontal: '5%',
        paddingVertical: '3%',
        borderBottomWidth: 1,
        borderColor: colors.line,
    },
    roundedBox: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.light,
        backgroundColor: colors.light,
        paddingHorizontal: '2%',
        paddingVertical: '2%',
        marginBottom: '3%',
    },
    layoutBox: {
        paddingHorizontal: '2%',
        paddingVertical: '2%',
    },
    layoutBoxTest: {
        paddingHorizontal: '2%',
        paddingVertical: '2%',
        borderWidth: 1,
    },


    //Text
    titleText: {
        fontSize: 25,
        color: colors.black,
        fontWeight: 'bold'
    },
    largeText: {
        fontWeight: '500',
        fontSize: 16,
        color: colors.black,
    },
    smallText: {
        fontSize: 15,
        color: colors.black,
    },
    contentText: {
        fontSize: 14,
        color: colors.black,
    },

    itemNameText: {
        fontSize: 15,
        color: colors.black,
        fontWeight: 'bold'
    },
    itemPriceText: {
        fontSize: 15,
        color: colors.black,
        fontWeight: 'bold'
    },
    itemNumberText: {
        fontSize: 13,
        color: colors.main,
    },
    itemDistanceText: {
        fontSize: 11,
        color: colors.dark
    },
    buttonText: {
        fontSize: 21,
        color: colors.white,
        fontWeight: 'bold'
    },
    inputText: {
        fontSize: 14,
        padding: 0,
        color: '#7A7A7A'
    },

    //Button
    activeButton: {
        height: 60,
        backgroundColor: colors.main,
        alignItems: 'center',
        justifyContent: 'center'
    },
    inActiveButton: {
        height: 60,
        backgroundColor: colors.light,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0.5,
        shadowColor: "black",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    smallButton: {
        width: 40,
        height: 40,
        backgroundColor: colors.dark,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    roundedButton: {
        width: ScreenWidth / 5,
        height: ScreenWidth / 5,
        backgroundColor: colors.light,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    bottomButton: {
        height: 60,
        flexDirection: 'row',
        shadowColor: "black",
        shadowOpacity: 0.5,
        shadowOffset: {
            height: 0,
            width: 0
        },
        elevation: 5,

    },

    countingBox:{
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.medium,
        borderRadius: 50,
        marginLeft: '2%'
    }
    ,
    //Image
    imageView: {
        borderRadius: 10,
        width: ScreenWidth / 6.5,
        height: ScreenWidth / 6.5,
    },
});
