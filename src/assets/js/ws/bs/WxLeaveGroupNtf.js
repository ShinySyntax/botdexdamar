/* 离群通知-- Server-->Client*/
var WxLeaveGroupNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
};
export default WxLeaveGroupNtf;