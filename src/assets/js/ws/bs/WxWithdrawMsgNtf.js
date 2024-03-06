/* 撤回消息通知-- Server-->Client*/
var WxWithdrawMsgNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
};
export default WxWithdrawMsgNtf;