/*
 * s    --> a&b   取消通话通知（a发起通话后，在对方响应前进行了取消操作）
 */
import store from '@/store/index.js';
import {msgTips} from '@/axios/path.js';
import {wxCallHangUp} from '@/assets/js/call';
var WxCall02_2CancelNtf = async function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);

    let curruid=store.state.User.currUid;
    store.commit('setCallShow',false);
    msgTips("通话取消");
    $(".iconvoicecall").removeClass("icon_select"); // 移除点击后的样式 
    if(bodyObj.fromuid!=curruid){
        wxCallHangUp(false);
    }
};
export default WxCall02_2CancelNtf;