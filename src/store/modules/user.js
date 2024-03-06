import {fetchGet} from '@/axios/http';
import {getWithCache,resUrl} from '@/assets/js/common';
import router from '@/router/index'
import {commonView,currUser} from '@/axios/path';
const state={
    currUser:null,//当前用户
    isLogined:false,//是否登录过了
    isSuper:false,//是否为超级管理员
    isNormal:false,//是否是普通注册用户
    currUid:'',//用户id
    isonlineuid:'',
    roles: {//角色
        adminNormal: 1,
        adminSuper: 99,
        normal: 2,
        uploadvideo: 6,
        allow_read_doc: 7,
        paid_doc: 8,
        paid_sitecode_qijian: 94, //购买了官网源代码旗舰版的角色
        paid_sitecode_baijin: 95, //购买了官网源代码白金版的角色
        paid_tiochat_base: 96     //购买了tio-chat普及版的角色
    },
    appcode: {
        NOTLOGIN : 1001,  //没有登录
        TIMEOUT :1002,  //登录超时
        KICKTED : 1003,  // 帐号在其它地方登录
        NOTPERMISSION : 1004,//登录了，但是没有权限操作
        REFUSE : 1005,//拒绝访问
        NEED_ACCESS_TOKEN : 1006,//需要提供正确的access_token
        CAPTCHA_ERROR : 1007,  // 图形验证码错误code
        KICKTED_H5:1010,
        NO_GRANT : 1099 // 未授权
    },
    friendErrorCode:{//好友相关错误码
        SYS_ERROR:20001,//系统异常
        BLACK:20002,//拉黑状态
        NO_LINK:20003,//未关联-不是好友
        Invalid_USER:20004,//无效用户
        SYS_ERROR_CODE: 20006,
    },
    GroupErrorCode:{//群组相关错误码
        SYS_ERROR:30001, //系统异常
        NO_LINK:30002//未关联-不在群组
    },
    loginModel:{//跳转登陆提示框
        show:false,
        msg:'登录异常'
    }
};
const actions={
    /* 获取配置 */
    async getComView({state,commit}){
        let viewData=await commonView();
        let viewConfig;
        if(viewData.ok){
            viewConfig=viewData.data;
            //alert(viewConfig.res_server)
            sessionStorage.setItem('tiocomconfig',JSON.stringify(viewConfig));
        };
        return viewConfig;
    },
    /* 获取当前用户 */
    async getCurrUser({state,commit}){
        let res=await currUser();
        if (res.code == state.appcode.KICKTED) {
            state.isLogined=false;
            return;
        } 
        if(res.ok){
            let data=res.data;
            $.extend(true,data,data,data['ipInfo']);
            state.currUser=data;
            state.currUid=data.id;
            state.currUser.avatar=resUrl(state.currUser.avatar);
            let userRoles=data.roles;
            state.isNormal=commit('judgeRoles',{userRoles,type:state.roles.normal});
            state.isSuper=commit('judgeRoles',{userRoles,type:state.roles.adminSuper});

            if(data.xx&&data.xx==1){
                state.isLogined=false;
            }else{
                state.isLogined=true;
            }
        }else{
            state.isLogined=false;
        }
    },
    /* 获取用户信息 */
    getUserInfo({state},uid) {
        if (!uid) {
            return null;
        }
        if (uid == state.currUid) {
            var ret = {};
            $.extend(true, ret, state.currUser);
            return ret;
        }
    
        var cacheName = "/user/info";
        if (state.isSuper) {
            cacheName = "/user/info1";
        }
        let key = uid;
        return getWithCache(cacheName, key, 8, async function (){
            var data = null;
            await fetchGet(cacheName,{uid}).then(res=>{
                if(res.ok){
                    data = res.data;
                }
            })
            return data;
        });
    }
};
const mutations={
    /* 判断角色 */
    judgeRoles(state,data){
        let rolelist=data.userRoles,
            roleid=data.type;
        if (!rolelist || rolelist.length == 0) {
            return false;
        }
        for (var i = 0; i < rolelist.length; i++) {
            if (rolelist[i] == roleid) {
                return true;
            }
        }
        return false;
    },
    /* 修改异常登录弹框信息 */
    setLoginModel(state,val){
        state.loginModel=val;
    },
    /* 用户信息 */
    setCurrUser(state,val){
        state.currUser=val;
    },
    /**用户状态和id */
    setIsonlineuid(state,val) {
        state.isonlineuid=val;
    }
};
export default {
    state,
    actions,
    mutations
}