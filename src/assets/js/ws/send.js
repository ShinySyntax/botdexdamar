import {formatCommand,commandReverse} from '@/assets/js/ws/command.js';
import {tiows} from '@/assets/js/ws/ws.js';
const wsSend= function (command, bodyObj) {
    var commandstr = formatCommand(command); //-128, 0002, 0012
    var commandname = commandReverse[commandstr]; //HeartbeatReq
    var str = commandstr;
    if (bodyObj) {
        str = commandstr + JSON.stringify(bodyObj);
        log(str+"str");
    }
    
    log('准备发送 ' + commandname + ":'" + str + "'");
    var uint8array = new TextEncoder().encode(str);
    tiows.ws.send(uint8array.buffer);
};
export default wsSend;