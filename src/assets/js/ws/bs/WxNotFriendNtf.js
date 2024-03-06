/*对方不是你好友通知*/
var WxNotFriendNtf = function (ws, event, commandName, bodyStr, bodyObj) {
    log("收到服务器消息", commandName, bodyObj);
};
export default WxNotFriendNtf;