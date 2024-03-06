import {friend,chatcom,chatInfo,msgTips} from '@/axios/path';
import {resUrl,formatSize1,btDate,messageEmoji,formatMilliseconds,getShowTime} from '@/assets/js/common';
const state={
    noReadApply:0,//申请好友未读个数
    chatOn:'',//当前会话id
    isGroup:true,//是否为群聊
    bizId:'',//当前会话-群聊groupid或私聊好友uid
    imgList:[],
    MessageList:[],//消息列表
    $chatEditor:null,//聊天室编辑器dom
    chatSofftop:0,//消息列表距离底部的距离
    applyList:[],//添加好友-申请列表
    chatList:[],//首页会话列表
    allNotRead:0,
    personAudio:null,//私聊消息提示音audio
    groupAudio:null,//群聊消息提示音
    chatInfo:{name:'',chatmode:1,joinnum:0},//会话详情
    //首次进入页面-默认初始值为1，首次进入页面为home页面-需请求长连接，这时需要在websocket连接完成后请求,在握手请求中处理
    isConnect:false,
    //私聊或群聊历史的请求参数startmid,unshift插入方式,chattype聊天类型：true为群聊，false为私聊
    chatOldMsg:{
        unshift:'',
        startmid:'',
        chattype:'',
        chatlinkid:''
    },
    islastmsg:false,//是否为最后一条消息
    applyThis:null,//apply重新指向this的对象
    template:null,
    groupmore:false,//聊天页面群聊信息弹框显示状态
    iscurrentpage:true,//当前页面在浏览器中是否处于激活状态
    channelContextid:'',//通道id
    focuskeys:[],//激活会话列表
};
const actions={
    /* 申请好友列表 -
        1.当处于申请列表页面，赋值列表数据 
        2.接收到WxUserSysNtf通知：处在当前列表页面刷新页面数据；
    */
    getApplyList({state}){
        friend.getApplyFriendList().then(res=>{
            if(res.ok){
                let data=res.data;
                    data.map(item=>{
                        item.avatar=resUrl(item.avatar);//头像
                    })
                state.applyList=data;
            }
        })
    },
    /* 添加好友-申请数据 */
    getApplyData({state}){
        friend.getApplyData().then(res=>{
            if(res.ok){
                if(res.data){
                    state.noReadApply=res.data;
                }else{
                    state.noReadApply=0;
                }
            }
        })
    },
    /* 获取会话列表 */
    async getChatRecent({state,commit}){
        await chatcom.chatRecent().then(res=>{
            console.log(res)
            // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>????????????????????????????!!!!!!!!!!!!!!!!!
            if(res.ok){
                let data=res.data;
                state.allNotRead=0;
                if(!data){
                    return;
                }
                data.map(item=>{
                    item.avatar=resUrl(item.avatar);//头像
                    // item.sendtime=getShowTime(item.sendtime,'chat');//时间
                    //处理最后一条消息的内容
                    if(item.sysflag==1&&item.sysmsgkey){
                        item.c=item.msgresume;
                        commit('msgTemplate',item);
                        item.msgresume= state.template;
                    }
                    item.msgresume=messageEmoji(item.msgresume);//最后一条消息的内容
                    state.allNotRead+=item.notreadcount;//总未读条数
                })
                state.chatList=data;
            }else{
                msgTips(res.msg||'系统错误');
                return []
            }
        })
    },
};
const mutations={
    /* 设置聊天室id */
    setChatOn(state,val){
        state.chatOn=val.chatOn;
        state.bizId=val.bizid;
        state.isGroup=val.isGroup;
    },
    /* 初始化聊天室数据 */
    initChatRoom(state){
        state.imgList=[];
        state.MessageList=[];
    },
    /* 修改消息列表数据 */
    setMessageList(state,val){
        state.MessageList=val;
    },
    posMessage(state,{val,pos}){
        state.MessageList[pos](val);
    },
    /* 消息列表距离底部的距离 */
    setChatSofftop(state,val){
        state.chatSofftop=val;
    },
    /* 赋值$chatEditor */
    setChatEditor(state,val){
        state.$chatEditor=val;
    },
    /**群聊刷新已读 */
    setGroupMsgRead(state, val) {
        if (val == state.bizId) {
            for(var i = 0; i<state.MessageList.length; i++) {
                state.MessageList[i].groupreadflag = 1;
            }
            state.MessageList = state.MessageList;
        }
    },
    /* 修改会话列表数据 */
    setChatList(state,val){
        state.chatList=val;
    },
    /* 计算未读条数 */
    setAllNotRead(state,val){
        state.allNotRead=val;
        if ($(window.parent.document).find("#tioim-container-iframe")) {
          let $notread = $(window.parent.document).find("#notread")
          $notread.html(val)
          $notread.show()
          if (val == 0) {
            $notread.hide()
          }
        }
    },
    /* 存储提示音dom */
    setAudioDom(state,val){
        state.personAudio=val.person;
        state.groupAudio=val.group;
    },
    /* 设置首次进入页面变量 */
    setIsConnect(state,val){
        state.isConnect=val;
    },
    /* 设置私聊或群聊参数 */
    setChatOldMsg(state,val){
        state.chatOldMsg=val;
    },
    /* 设置applyThis-在其他页面需要调用vue相关页面的变量和方法时使用 */
    setApplyThis(state,val){
        state.applyThis=val;
    },
    /* 设置会话详情 */
    setChatInfo(state,val){
        state.chatInfo=val;
    },
    //设置会话详情单个属性值
    setChatInfoKey(state,{key,val}){
        state.chatInfo[key]=val;
    },
    /* 处理消息格式 */
    chatMessageCt(state,{bodyObj, fromuser, sendtype, unshift}) {
        let hasMsg=state.MessageList.find(item=>item.mid==bodyObj.mid);
        log('hasMsg')
        log(hasMsg)
        log('hasMsg')
        if(hasMsg){
            return;
        }
        let ct = bodyObj.ct;
        let bodyhtml = "";
        let bodycparse;
        sendtype = ct==13?3:sendtype// 判断是否是入群申请是的话把他的类型变成系统消息
        // 1、普通文本消息，2、超链接卡片消息，3、文件，4、音频，5、视频 ,6.图片 ,9.名片,10.视频通话,11.音频通话
        let bodyc=bodyObj.c;
        if(bodyObj.sysmsgkey&&bodyObj.sendbysys==1){
            this.commit('msgTemplate',bodyObj);
            bodyc= state.template;
        }
        let bodyData;//消息
        switch (ct) {
            case 1:
                //内容换行
                bodyhtml = bodyc.replace(/\n/g, '<br>');
                //表情编译-begin
                bodyhtml=messageEmoji(bodyhtml);
                //网址处理
                let reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-|:)+)/g;
                bodyhtml = bodyhtml.replace(reg, "<a href='$1$2' target='_blank' class='texthttp'>$1$2</a>");
                break;
            case 3:
                bodycparse= JSON.parse(bodyc);
                let size=formatSize1(bodycparse.size),
                    url=resUrl(bodycparse.url);
                bodyhtml = `<a href="${url}" target="_blank" 
                        download="${bodycparse.filename}" class="tm-download flexbox">
                        <p class="tm-filename">${bodycparse.filename}</p>
                    </a>`;
                    /* <div class="wx-file-size">
                            <i class="iconfont icon-fileRegular"></i>
                            <p class="filesize">${size}</p>
                        </div> */
                break;
            case 4:
                bodycparse = JSON.parse(bodyc);
                bodycparse.play=false;
                if(bodycparse.seconds){
                    bodycparse.width =  bodycparse.seconds * 5.8;
                }
                bodyhtml= `<audio src="${resUrl(bodycparse.url)}" class="audio" id="audio${bodycparse.id}" mid='${bodyObj.mid}'></audio>`;
                bodyData={
                    ...bodycparse,
                };
                break;
            case 5:
                bodycparse = JSON.parse(bodyc);
                let cwidth = bodycparse.coverwidth,
                    cheight = bodycparse.coverheight,
                    vcoverurl= resUrl(bodycparse.coverurl),//封面地址
                    videourl=resUrl(bodycparse.url);//视频地址
                let sWidth, sHeight;
                if (cwidth >= 160) {
                    sWidth = 160;
                } else {
                    sWidth = cwidth;
                }
                sHeight = sWidth * cheight / cwidth;
                bodyData={
                    ...bodycparse,
                    sWidth:sWidth+'px',
                    sHeight:sHeight+'px',
                    vcoverurl,
                    videourl
                };
                break;
            case 6:
                bodycparse = JSON.parse(bodyc);
                let { coverwidth, coverheight } = bodycparse;
                let showWidth, showHeight;
                let coverurl=resUrl(bodycparse.coverurl),
                    realimgurl=resUrl(bodycparse.url);
                if (coverwidth >= 160) {
                    showWidth = 160;
                } else {
                    showWidth = coverwidth;
                }
                showHeight = showWidth * coverheight / coverwidth;
                bodyData={
                    ...bodycparse,
                    showWidth:showWidth+'px',
                    showHeight:showHeight+'px',
                    coverurl
                };
                if(unshift){
                    state.imgList.unshift({'imgsrc':realimgurl,'mid':bodyObj.mid});
                }else{
                    state.imgList.push({'imgsrc':realimgurl,'mid':bodyObj.mid});
                }
               
                break;
            case 9:
                bodycparse = JSON.parse(bodyc);
                bodycparse.bizavatar=resUrl(bodycparse.bizavatar);
                bodyData={
                    ...bodycparse,
                };
                break;
            case 10:
            case 11:
                bodycparse = JSON.parse(bodyc);
                this.commit('hangUpReason',{type:bodycparse.hanguptype,call:bodycparse.calltype,sendtype,duration:bodycparse.duration});
                bodyData={
                    ...bodycparse,
                    reason:state.template
                };
                break;
            case 15:
                console.log("bodyObj==",bodyObj)
                bodycparse = JSON.parse(bodyc);
                let content = bodycparse.content
                if(content!=null && content!==undefined){
                  
                    bodyhtml = content.replace(/\n/g, '<br>');
                    //表情编译-begin
                    bodyhtml=messageEmoji(bodyhtml);
                    //网址处理
                    let reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-|:)+)/g;
                    bodyhtml = bodyhtml.replace(reg, "<a href='$1$2' target='_blank' class='texthttp'>$1$2</a>");
                }
                console.log("mediacontent==",bodycparse)
                console.log("content==",content)
                bodyData={
                    ...bodycparse,
                };
                break;
        }
        let curruid=this.state.User.currUid;
        //删除消息-是否显示
        if(bodyObj.whereflag==1){
            let whereIndex=bodyObj.whereuid.indexOf(','+curruid+',');
            if(whereIndex!=-1){
                bodyObj.delwhere=true;
            }else{
                bodyObj.delwhere=false;
            }
        }else{
            bodyObj.delwhere=false;
        }
        //如果有单通道sigleflag参数，sigleflag为1&&单通道uid等于当前用户id||sigleflag为2
        let sigleflag=bodyObj.sigleflag;
        if((sigleflag==1&&bodyObj.sigleuid==curruid)||sigleflag==2||!sigleflag){
            bodyObj.singleshow=true;
        }
        // btDate(bodyObj.t)
        let contactdata={ ...bodyObj, type: sendtype, html: bodyhtml, name: fromuser.nick, avatar: resUrl(fromuser.avatar), uid: bodyObj.uid ? bodyObj.uid : bodyObj.f ,bodyData};

        if(unshift){
          log('ws下的历史消息 ----------')
          // 音视频聊天中的reason不为空放进MessageList数组中
          if(contactdata.ct==10||contactdata.ct==11){
            if(contactdata.bodyData.reason!==''){
              state.MessageList.unshift(contactdata);
            }
          }else{
              state.MessageList.unshift(contactdata);
          }
        }else{
          log('ws下的发送消息 ----------')
            //解决历史消息和通知到达时间差导致一条消息多次显示的问题,（当前台接收到消息通知时，历史消息里边一定存在）
            let messageLength=state.MessageList.length;
            if(messageLength>=1){
                let lastmid=0;
                for(let i=1;i<messageLength;i++){
                    let lastmsg=state.MessageList[messageLength-i];
                    if(!lastmsg.noIn){
                        lastmid=lastmsg.mid;
                        break;
                    }
                }
                
                if(bodyObj.mid<=lastmid){
                    log('bodyObj.mid<=lastmid')
                    return;
                }
            }
            state.MessageList.push(contactdata);
        }
        

    },
    /* 手动处理接收消息通知时-会话列表数据 */
    changeChatList(state,bodyObj){
        let {chatlinkid,ct,sendbysys,at,sysmsgkey,actflag,actname,mid,uid,t,c,g,nick,linkflag,readflag,chatItems,grouprole}=bodyObj;
        let chatList=state.chatList;//会话列表
        let curruid=this.state.User.currUid;
        //判断会话列表中是否有记录
        let index=chatList.findIndex(item=>item.id==chatlinkid);
        let changeData={};
        let isNowChat=false;//接收的通知是否处在当前聊天的界面
        let isSendByMe=curruid==(uid||bodyObj.f);//是否为自己发送的消息通知
        let currRead=0;//这条通知的未读
        log('state.chatOn')
        log(state.chatOn)
        log('state.chatOn')
        log('chatlinkid')
        log(chatlinkid)
        log('chatlinkid')
        //如果页面的chatlinkid等于当前通知
        if(state.chatOn==chatlinkid){
            isNowChat=true;
        }
        if(sysmsgkey){
            this.commit('msgTemplate',bodyObj);
            bodyObj.c=state.template;
            c=bodyObj.c;
        }
        let topNum=0;
        $.each(chatList,function(index,item){
            if(item.topflag==1){
                topNum++;
            }
        });
        let isinChat=state.focuskeys.find(item=>item==chatlinkid);
        if(actflag==1&&index==-1){
            changeData={
                avatar:resUrl(bodyObj.actavatar),
                notreadcount:(isNowChat||isSendByMe||sendbysys==1||isinChat)?0:1,
                name:actname,
                id:chatlinkid,
                chatmode:1,//私聊
                linkflag:linkflag||1,
                c:c,
            };
            if(g){//如果是群聊
                changeData.chatmode=2;
                changeData.bizid=g;
                changeData.bizrole=grouprole;
            }else{
                changeData.chatmode=1;
                changeData.bizid=uid;
            }
            currRead=changeData.notreadcount;
        }else{
            changeData=chatList[index];
            //增加未读消息条件：不处在当前会话&&(私聊且未读或者群聊)&&不是自己发送&&不是系统消息
            if(!isNowChat&&((!g&&readflag==2)||g)&&!isSendByMe&&sendbysys!=1&&!isinChat){
                changeData.notreadcount++;//未读消息条数
                currRead=1;
            }
            changeData.linkflag=linkflag||changeData.linkflag;
        }
        changeData.lastmsguid=uid;//最后一条消息发送者id
        changeData.ct=ct;//消息类型
        changeData.toreadflag=readflag;
        changeData.fromnick=nick;
        changeData.sysflag=sendbysys;
        changeData.lastmsgid=mid;//最后一条消息的id
        if(chatItems){
            chatItems
        }
        this.commit('setAllNotRead',(state.allNotRead+currRead));//总未读条数
        //群聊&&不在当前聊天界面&&存在at字段
        if(g&&!isNowChat&&at){
            at.indexOf(curruid)!=-1||at.indexOf('all')!=-1?changeData.atreadflag=2:'';
        }
        let bodyhtml = "";
        // 1、普通文本消息，2、超链接卡片消息，3、文件，4、音频，5、视频 ,6.图片 ,9.群名片 ,12.红包 ,88.链接
        switch (ct) {
            case 1:
                //内容换行
                bodyhtml = c.replace(/\n/g, '<br>');
                bodyhtml=messageEmoji(c);
                break;
            case 3:
                bodyhtml="分享一个文件";
                break;
            case 4:
                bodyhtml="[语音消息]";
                break;
            case 5:
                bodyhtml="分享一个视频";
                break;
            case 6:
                bodyhtml="分享一个图片";
                break;
            case 9:
                bodyhtml="分享一个名片";
                break;
            case 10:
                bodyhtml="[视频通话]";
                break;
            case 11:
                bodyhtml="[音频通话]";
                break;
            case 12:
                bodyhtml=isSendByMe?"发出红包，请在手机端查看":"收到红包，请在手机端查看"
                break;
            case 13:
                bodyhtml="收到一条入群申请";
                break;
            case 15:
                bodyhtml="收到一条多媒体消息";
                break;     
            case 88:
                bodyhtml="分享一个链接";
                break;
        }
        changeData.sendtime=t;
        changeData.msgresume=bodyhtml;
        if(chatItems&&chatItems.msgresume){
            changeData=Object.assign(changeData,chatItems);
        }
        //会话列表存在会话记录&&激活状态不为1
        if(index!=-1&&actflag!=1){
            //当前消息不为第一条会话
            if(index!=0){
                let thiscol=chatList.splice(index,1);
                let col=thiscol[0];
                if(col.topflag==1){
                    chatList.unshift(col);
                }else{
                    chatList.splice(topNum, 0, changeData);
                }
            }
        }
        if(index==-1&&actflag==1){
            chatList.splice(topNum, 0, changeData);
        }
    },
    /* 会话模板 */
    msgTemplate(state,item){
        let mynick=this.state.User.currUser.nick;
        let nick=item.opernick;//操作者
        let tonicks=item.tonicks;//发送者
        nick=(nick==mynick)?'你':'"'+nick+'"';
        tonicks=(tonicks==mynick)?'你':'"'+tonicks+'"';
        let c=item.c;
        switch(item.sysmsgkey){
            case 'create':
                c=nick+"邀请"+tonicks+"加入了群聊";
                break;
            case 'join':
                c=nick+"邀请"+tonicks+"加入了群聊";
                break;
            case 'ownerleave':
                c=nick+"退出了群聊，"+tonicks+"自动成为群主";
                break;
            case 'leave' :
                c=nick+"退出了群聊";
                break;
            case 'operkick' :
                c=nick+"将"+tonicks+"移除了群聊";
                break;
            case 'tokick' :
                c=tonicks+"被"+nick+"移除了群聊";
                break;
            case 'msgback' :
                c=nick+"撤回了一条消息";
                break;
            case 'managermsgback' :
                c=nick+"撤回了一条成员消息";
                break;
            case 'ownerchange' :
                c=nick+"将群主转让给了"+tonicks;
                break;
            case 'applyopen'  :
                c=nick+"开启了群邀请开关：所有人都可以邀请人员进群";
                break;
            case 'applyclose' :
                c=nick+"关闭了群邀请开关：只有群主或者群管理员才能邀请人员进群";
                break;
            case 'reviewopen' :
                c=nick+"开启群审核开关：成员进群前,必须群主或者群管理员审核通过";
                break;
            case 'reviewclose' :
                c=nick+"关闭了群审核开关：成员进群不需要审核";
                break;
            case 'updatenotice' :
                c=nick+"修改了群公告:"+tonicks;
                break;
            case 'updatename' :
                c=nick+"修改了群名称:"+tonicks;
                break;
            case 'delgroup'  :
                c=nick+"解散了群";
                break;
        }
        state.template=c;
    },
    /* 
        音视频消息类型 
        @param{*} type 挂断类型
        @param{*} call 音视频通话类型 10:视频通话 11:音频通话
        @param{*} sendtype 发送者类别 1:自己发送 2:别人发送
        @param{*} duration 通话时长milliseconds
    */
    hangUpReason(state,{type,call,sendtype,duration}){
        //1:自己发送  2：好友发送  
        let data='';
        let callstr=call==10?'视频':'语音';
        switch(type){
            case 1:
                data='通话时长'+formatMilliseconds(duration);
                break;
            case 2:
                data=sendtype==1?'对方已拒绝':'已拒绝';
                break;
            case 3:
                data=sendtype==1?'对方忙线中':'';
                break;
            case 4:
            case 5:
            case 6:
                data='系统自动挂断';
                break;
            case 7:
                data='系统重启';
                break;
            case 8:
                data=sendtype==1?'对方不在线':callstr+'通话未接听';
                break;
            case 9:
                data=sendtype==1?'对方未接听':callstr+'通话未接听';
                break;
            case 10:
                data=sendtype==1?callstr+'通话已取消':'对方已取消';
                break;
            case 99:
                data='还没挂断';
                break;
        }
        state.template=data;
        $(".iconVideocall").removeClass("icon_select"); // 移除点击后的样式
        $(".iconvoicecall").removeClass("icon_select"); // 移除点击后的样式
    },
    /* 是否为最后一条消息 */
    setIsLastMsg(state,val){
        state.islastmsg=val;
    },
    /* 聊天页面群聊信息弹框显示状态 */
    setGroupMore(state,val){
        state.groupmore=val;
    },
    /* 监听页面激活状态 */
    currentPage(state) {
        var hiddenProperty = 'hidden' in document ? 'hidden' :
        'webkitHidden' in document ? 'webkitHidden' :
            'mozHidden' in document ? 'mozHidden' :
            null;
        var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
        var onVisibilityChange = function () {
            if (!document[hiddenProperty]) {
                state.iscurrentpage=true;
                let tioConfig=sessionStorage.getItem("tiocomconfig");
                    tioConfig=JSON.parse(tioConfig);
                $("#tiotitle").html(tioConfig.tioim_title);//标题
                //iframe父页面标题
                if ($(window.parent.document).find("#tioim-container-iframe")) {
                    $(window.parent.document).find("title").html(window.parent.document.tioim_title_back)
                }
            } else {
                state.iscurrentpage=false;
            }
        }
        document.addEventListener(visibilityChangeEvent, onVisibilityChange);
    },
    /* 设置页面消息提醒 */
    setPageTitle() {
        let newtitle = '您有新消息';
        $("#tiotitle").html(newtitle);
        if ($(window.parent.document).find("#tioim-container-iframe")) {
            if (!window.parent.document.tioim_title_back) {
              window.parent.document.tioim_title_back = $(window.parent.document).find("title").html()
            }
            $(window.parent.document).find("title").html(newtitle)
        }
    },
    /* 设置通道id */
    setChannelContextid(state,val){
        state.channelContextid=val;
    },
    /* 设置激活会话id数据 */
    setFocusKeys(state,val){
        state.focuskeys=val;
    },
    /* 设置好友申请数量 */
    setNoReadApply(state,val){
        state.noReadApply=val;
    },

};
export default {
    state,
    actions,
    mutations
}