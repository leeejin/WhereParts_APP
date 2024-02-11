import { StyleSheet, Dimensions } from 'react-native';
import { colors } from "../styles/template/page_style";
const ScreenHeight = Dimensions.get('window').height;
const ScreenWidth = Dimensions.get('window').width;
export const styles = StyleSheet.create({


    //내정보 부분
    viewHeaderLayout: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        backgroundColor: colors.main,
        
    },//
    container: {
        margin: 15,
    },
    sub_background:{
        backgroundColor: colors.white,
         height: '100%' 
    },
    item2: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },//

    name_text: {
        color:colors.black,
        fontWeight: 'bold',
        fontSize: 20,
    },
    sub_text: {
        color:colors.black,
        fontWeight: 'bold',
        fontSize: 18,
    },
    content:{
        color:colors.dark,
        fontWeight:'bold',
    },
    btn: {
        backgroundColor:colors.white,
        borderRadius: 20,
        shadowColor: colors.black,
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 5,
    },//

    btn_text: {
        fontWeight:'bold',
        color:colors.black,
        marginTop: 10,
    },//
   
    input: {
        borderColor: colors.medium,
        backgroundColor: colors.white,
        position: 'relative'
    },
    search_btn: {
        position: 'absolute',
        top: 12.5,
        right: 30,
    },
    page_view: {
        position: 'absolute',
        width: '100%',
        backgroundColor:colors.white,
        padding:10,
        bottom:0
        //borderWidth:1,
    },
    outputStyle: {
        borderColor: colors.light,
        borderWidth: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15
    },
    outputStyle_sub:{
        width: '80%' ,
        borderRightWidth:0.5,
        borderRightColor:colors.medium
    },
    center:{
        justifyContent:'center',
        alignItems:'center',
    },
    //설정 부분
    viewBodyLayout: {
        //borderWidth:1,
    },//

    modal_background: {
       
        backgroundColor:'rgba(0,0,0,0.5)',//불투명도 40%
        height: '100%',
    },
    modal1: {
        paddingTop: 50,
        paddingBottom: 25,
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    modal2: {
        backgroundColor: colors.main,
        width: '70%',
        padding: 20,
    },
    modal3: {
        backgroundColor: colors.medium,
        width: '30%',
        padding: 20,
    }
})