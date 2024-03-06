/*
 * a和b都执行此方法
 * 通知结束通话，通话原因：1、对方主动挂电话；2、网络不好
 */
import store from '@/store/index.js';
import {callSetSomeValue,wxCallHangUp} from '@/assets/js/call';
import {msgTips} from '@/axios/path.js';
var WxCall14EndNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    //关闭通话弹框
    store.commit('setCallShow',false);
    //重设通话状态
    store.commit('resetCallObj');
    let curruid=store.state.User.currUid;
    var req = {};
    callSetSomeValue(req, bodyObj);  //透传填值
    wxCallHangUp(false);
    let callstate=store.state.Call;
    let {fullState}=callstate;

    if(fullState){
        store.commit('exitFullScreen');
    }
    //挂断方用户id不等于当前用户uid并且为接通状态（默认接通时间大于0为接通状态）
    if(bodyObj.hangupuid!=curruid&&bodyObj.callduration>0){
        msgTips("通话结束");
    }
    /* 断掉通话-清除计时器 */
    if(callstate.talk.timer){
        callstate.talk.time='00:00';
        clearInterval(callstate.talk.timer);
    }
};
export default WxCall14EndNtf;