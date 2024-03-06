/*消息提示*/
import router from '@/router/index';
import {msgTips} from '@/axios/path.js';
var MsgTip = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
    let code=bodyObj.code;
    switch(code){
        case 1:
            router.push('/login');
            break;
        case  2:
        case 99:
            msgTips(bodyObj.msg);
            break;  
    }
};
export default MsgTip;