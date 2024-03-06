import {fetchPost,fetchGet,fetchUpload} from '@/axios/https';
import {getWithCache} from '@/assets/js/common';
import Vue from 'vue';
import layer from 'vue-layer';
import 'vue-layer/lib/vue-layer.css';
let $layer=layer(Vue);
/* 弹框提示 */
export function msgTips(msg){
    $layer.msg(msg||'网络异常');
}
export function layerLoading(){
    $layer.loading();
}
export function layerCloseAll(){
    $layer.closeAll();
}
/* 公共变量 */
function commonView(){
    return fetchGet("/config/viewmodel");
}
/* im服务 */
function imServer(){
    return fetchGet("/im/imserver");
}
/* 用户信息 */
function currUser(){
    return fetchGet("/user/curr");
}
/* 上传文件 */
function uploadFile(url,data){
    return fetchUpload(url,data);
}
/* 打洞服务器 */
function getTurnServer(groupid,userflag){
    let cacheName = "/im/turnserver";
    let key = "x";
    return getWithCache(cacheName, key, 10, async function (){
        var data = null;
        await fetchGet(cacheName,{groupid,userflag}).then(res=>{
            if(res.ok){
                data = res.data;
            }
        })
        return data;
    });
};
/* 用户接口 */
const user={
    /* 用户登录 */
    userLogin(data){
        return fetchPost("/login/loginWithTioNo",data);
    },
    /* 忘记密码 */
    retrievePwd(data){
        return fetchPost("/register/retrievePwd",data);
    },
    /* 注册 */
    userRegister(data){
        let url = ''
        if (data.code=='') {
          url ="/register/1";
        } else {
          url ="/register/2";
        }
        return fetchPost(url,data);//1邮箱，2是手机验证
    },
    /* 修改用户信息 */
    updatUser(data){
        return fetchPost("/user/updatUser",data);
    },
    /* 修改用户头像 */
    updateAvatar(data){
        return fetchUpload("/user/updateAvatar",data);
    },
    /* 修改密码 */
    updatePwd(data){
        return fetchPost("/user/updatePwd",data);
    },
    /* 退出登录 */
    logout(){
        return fetchPost("/logout", []);
    },
    /* 获取验证图片  以及token */
    reqGet(data){
        return fetchPost("/anjiCaptcha/get",data);
    },
    /* 滑动或者点选验证 */
    reqCheck(data){
        return fetchPost("/anjiCaptcha/check",data);
    },
    /* 二次校验接口 */
    reqverify(data){
        return fetchPost("/anjiCaptcha/verify",data);
    },
    /* 发送短信 */
    smsSend(data){
        return fetchGet("/sms/send",data);
    },
    /* 发送短信 */
    smsCheck(data){
        return fetchGet("/sms/check",data);
    },
    /* 发送短信前验证 */
    smsBeforeCheck(data){
        return fetchGet("/sms/beforeCheck",data);
    },
    /* 忘记密码-重置手机用户密码-前置 */
    userResetPwdBefore(data){
        return fetchGet("/user/resetPwdBefore",data);
    },
    /* 忘记密码-重置手机用户密码 */
    userResetPwd(data){
        return fetchGet("/user/resetPwd",data);
    },
    /* 第三方绑定手机号 */
    userThirdbindphone(data){
        return fetchGet("/user/thirdbindphone",data);
    },
    /* 手机注册绑定邮箱 */
    userRegbindemail(data){
        return fetchPost("/user/regbindemail",data);
    },
    /* 后台账号登录 */
    ndapiLogin(data){
      return fetchPost("/ndapi/login",data);
    },
    /* 后台链入-自动登录 */
    ndapiAutologin(data){
      return fetchPost("/ndapi/autologin",data);
    },
};
/* 私聊群聊公用 */
const chatcoms={
    /* 获取会话列表 */
    chatRecent(){
        return fetchGet("/chat/list");
    },
    /* 用户会话操作  */
    chatOper(data){
        return fetchPost("/chat/oper",data);
    },
    /* 消息操作 */
    msgOper(data){
        return fetchPost("/chat/msgOper",data);
    },
    /* 转发消息 */
    msgForward(data){
        return fetchPost("/chat/msgForward",data);
    },
    /* 通讯录 */
    chatMailList(data){
        return fetchGet("/chat/mailList",data);
    },
    /* 聊天激活 */
    chatActChat(data){
        return fetchGet("/chat/actChat",data);
    },
    chatActStrangerChat(data){
        return fetchGet("/chat/actChatStranger",data);
    },
    /* 分享名片 */
    shareCard(data){
        return fetchPost("/chat/shareCard",data);
    },
    /* 绑定手机号 */
    bindphone(data){
        return fetchPost("/user/bindphone",data);
    },
    /* 修改手机号 */
    bindnewphone(data){
        return fetchPost("/user/bindnewphone",data);
    },
    /* 会话已读ack */
    chatReadAck(data){
        return fetchGet("/chat/readAck",data);
    },
    /* 会话免打扰操作：好友免打扰/群免打扰 */
    msgfreeflag(data){
        return fetchPost("/chat/msgfreeflag",data);
    },
    /* 举报投诉 */
    sysReport(data){
        return fetchPost("/sys/report",data);
    },
};
/* 好友 */
const friend={
    /* 申请数据 */
    getApplyData(data){
        return fetchGet("/chat/applyData",data);
    },
    /* 申请列表 */
    getApplyFriendList(data){
        return fetchGet("/chat/applyList",data);
    },
    /* 是否为我的好友 */
    isMyFriend(touid) {
        let cacheName ="/chat/isFriend";
        let key=touid;
        return getWithCache(cacheName, key, 10, async function (){
            var data = null;
            await fetchPost(cacheName,{touid}).then(res=>{
                if(res.ok){
                    data = res.data;
                }
            })
            return data;
        });
    },
    /* 添加好友-检测 */
    checkAddFriend(data){
        return fetchGet("/chat/checkAddFriend",data);
    },
    /* 添加好友-非验证加好友 */
    chatAddFriend(data){
        return fetchPost("/chat/addFriend",data);
    },
    /* 修改好友备注名 */
    modifyRemarkname(data){
        return fetchPost("/friend/modifyRemarkname",data)
    },
    /* 删除好友 */
    delFriend(data){
        return fetchPost("/chat/delFriend",data);
    },
    /* 同意申请 */
    dealApply(data){
        return fetchPost("/chat/dealApply",data);
    },
    /* 申请添加好友 */
    friendApply(data){
        return fetchPost("/chat/friendApply",data);
    },
    /* 搜索用户 */
    searchUser(data){
        return fetchGet("/user/search",data);
    },
    /* 忽略好友申请 */
    friendIgnoreApply(data){
        return fetchGet("/friend/ignoreApply",data);
    }
}
/* 群聊 */
const group={
    addMediaGroupChat(data){
        return fetchPost("/chat/addMediaGroupChat",data);
    },
    /* at用户列表 */
    atGroupUserList(data){
        return fetchGet("/chat/atGroupUserList",data);
    },
    /* 更改群名称 */
    modifyName(data){
        return fetchPost("/group/modifyName",data);
    },
    /* 群聊信息 */
    //查询自己的用户信息标识：1：是；2：否
    getWxGroupInfo(groupid,userflag){
        let cacheName = "/chat/group";
        let key=groupid+userflag;
        return getWithCache(cacheName, key, 5, async function (){
            var data = null;
            await fetchGet(cacheName,{groupid,userflag}).then(res=>{
                if(res.ok){
                    data = res.data;
                }
            })
            return data;
        });
    },
    getchatGroupInfo(data){
        return fetchPost("/chat/group",data);
    },
    /* 群成员检测 */
    checkGroupUser(data){
        return fetchGet('/chat/checkGroupUser',data);
    },
    /* 删除群成员 */
    kickGroup(data){
        return fetchPost("/chat/kickGroup",data);
    },
    /* 群名片进群检查 */
    checkCardJoinGroup(data){
        return fetchGet('/chat/checkCardJoinGroup',data);
    },
    /* 邀请成员 */
    directInvite(data){
        return fetchPost("/chat/joinGroup",data);
    },
    /* 群成员 */
    groupMember(data){
        return fetchGet("/chat/groupUserList",data);
    },
    /* 修改群简介 */
    modifyIntro(data){
        return fetchPost("/group/modifyIntro",data);
    },
    /* 修改群公告 */
    modifyNotice(data){
        return fetchPost("/group/modifyNotice",data);
    },
    /* 修改群昵称 */
    modifyGroupNick(data){
        return fetchPost("/chat/modifyGroupNick",data);
    },
    /* 离开群聊 */
    leaveGroup(data){
        return fetchPost("/chat/leaveGroup",data);
    },
    /* 检查是否可以发送卡片 */
    checkSendCard(data){
        return fetchGet("/chat/checkSendCard",data);
    },
    /* 修改进群方式 */
    modifyApply(data){
        return fetchPost("/chat/modifyApply",data);
    },
    /* 解散群聊 */
    delGroup(data){
        return fetchPost("/chat/delGroup",data);
    },
    /* 转让群主 */
    changeOwner(data){
        return fetchPost("/chat/changeOwner",data);
    },
    /* 可添加好友 */
    applyGroupFdList(data){
        return fetchGet("/chat/applyGroupFdList",data);
    },
    /* 增加群成员 */
    joinGroup(data){
        return fetchPost("/chat/joinGroup",data);
    },
    /* 创建群聊 */
    createGroup(data){
        return fetchPost("/chat/createGroup",data);
    },
    /* 禁言 */
    chatForbidden(data){
        return fetchPost("/chat/forbidden",data);
    },
    /* 禁言-禁言用户列表 */
    forbiddenUserList(data){
        return fetchPost("/chat/forbiddenUserList",data);
    },
    /* 用户禁言状态 */
    chatForbiddenFlag(data){
        return fetchPost("/chat/forbiddenFlag",data);
    },
    /* 修改群审核开关 */
    modifyReview(data){
        return fetchPost("/group/modifyReview",data);
    },
    /* 群免打扰 */
    modifyGroupPush(data){
        return fetchPost("/group/modifyGroupPush",data);
    },
    /* 修改群头像 */
    modifyAvatar(data){
        return fetchUpload("/group/modifyAvatar",data);
    },
    /* 群管理员操作 */
    group_manager(data){
        return fetchPost("/group/manager",data);
    },
    /* 修改群添加好友开关 */
    modifyFriendFlag(data){
        return fetchPost("/group/modifyFriendFlag",data);
    },
    /* 群加入申请 */
    joinGroupApply(data){
        return fetchPost("/chat/joinGroupApply",data);
    },
    /* 群申请处理 */
    dealGroupApply(data){
        return fetchPost("/chat/dealGroupApply",data);
    },
    groupApplyInfo(data){
        return fetchPost("/chat/groupApplyInfo",data);
    },
}

export {
    commonView,
    imServer,
    getTurnServer,
    uploadFile,
    currUser,
    user,
    chatcoms,
    friend,
    group
}
