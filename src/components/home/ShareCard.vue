<template>
    
    <div class="card-container" @click.stop="stopProp">
        <!-- 发送好友名片弹框 -->
        <div class="remindContent send-card" v-show="pcarshow">
            <p class="remind-title">
                <span>选择推荐的好友</span>
                <i class="iconfont iconIMweb_cancel_cancel closeicon" @click="closeDialog"></i>
            </p>
            <p class="tm-search-friend">
                <i class="iconfont iconIMweb_search"></i>
                <input type="text" autocomplete="off" placeholder="请输入好友名称" class="tm-search-input" @input="friendQuerylist" v-model="pcardsearch">
            </p>
            <div id="friendListCard" class="remindbody cardlist">
                <ul class="remindfriends card-content">
                    <div v-if="myFriendFilter.length==0" class="nodata-content" >
                        <img src="~@/assets/imgs/common/nodata.png" class="search-nodata"/>
                        <p class="search-nodata_tips">抱歉，没有找到相关信息</p>
                    </div>
                    <div v-for="v in myFriendFilter" :key="v.index">
                        <p class="letter-index">{{v.index}}<p> 
                        <li  class="remind-col"  v-for="item in v.data" :key="item.uid"  @click="showCard(item,1)">
                            <el-image  class="remind-col_img" :src="item.avatar">
                                <div slot="error" class="image-slot">
                                    <img src="~@/assets/imgs/common/avatar.jpg" class="error-img"/>
                                </div>
                            </el-image>
                            <span class="flexauto" v-html="brightenKeyword(item.remarkname||item.nick,pcardsearch)">
                            </span>
                        </li>
                    </div>
                </ul>
            </div>
        </div>
        <!-- 好友名片弹框 -->
        <Dialog v-show="tocardshow">
            <div  class="modelbody sharebody">
                <p class="title">{{sharetype==1?'好友推荐':'群聊推荐'}}</p>
                <div class="share-content">
                    <div class="card-info">
                        <div class="card-main">
                            <el-image  class="card-avatar" :src="cardInfo.toavatar">
                                <div slot="error" class="image-slot">
                                    <img src="~@/assets/imgs/common/avatar.jpg" class="error-img"/>
                                </div>
                            </el-image>
                            <span class="share-name">{{cardInfo.name}}</span>
                        </div>
                        <p class="share-tips">{{sharetype==1?'个人名片':'群名片'}}</p>
                    </div> 
                    <p class="to-title">将名片分享给{{isGroup?'该群聊':'该用户'}}</p>
                    <div class="to-content">
                        <el-image  class="to-avatar" :src="chatinfo.avatar">
                            <div slot="error" class="image-slot">
                                <img src="~@/assets/imgs/common/avatar.jpg" class="error-img"/>
                            </div>
                        </el-image>
                        <span class="to-name">{{chatinfo.name}}</span>
                    </div>
                </div>
                
               <div class="button-group">
                    <button class="primarybtn default" @click="cancleToShare">取消</button>
                    <button class="primarybtn" @click="sureSendCard" :disabled="loading">发送名片</button>
                </div>
            </div>
        </Dialog>
        <!-- 推荐群聊 -->
        <div class="remindContent send-card" v-show="gcarshow">
            <p class="remind-title">
                <span>选择推荐的群聊</span>
                <i class="iconfont iconIMweb_cancel_cancel closeicon" @click="closeDialog"></i>
            </p>
            <p class="tm-search-friend">
                <i class="iconfont iconIMweb_search"></i>
                <input type="text" autocomplete="off" placeholder="请输入群聊名称" class="tm-search-input" @input="groupQuerylist" v-model="gcardsearch">
            </p>
            <div id="groupListCard" class="remindbody cardlist">
                <ul class="remindfriends card-content">
                    <div v-if="groupCardFilter.length==0" class="nodata-content" >
                        <img src="~@/assets/imgs/common/nodata.png" class="search-nodata"/>
                        <p class="search-nodata_tips">抱歉，没有找到相关信息</p>
                    </div>
                    <li  class="remind-col flexbox cursor"  v-for="item in groupCardFilter" :key="item.groupid"   @click="showCard(item,2)">
                        <el-image  class="remind-col_img" :src="item.avatar">
                            <div slot="error" class="image-slot">
                                <img src="~@/assets/imgs/common/avatar.jpg" class="error-img"/>
                            </div>
                        </el-image>
                        <span class="flexauto"  v-html="brightenKeyword(item.name,gcardsearch)">
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    
</template>
<script>
import {defineScroll,resUrl} from '@/assets/js/common';
import {chatcom,msgTips} from '@/axios/path';
import { mapState } from 'vuex';
import wsSend from '@/assets/js/ws/send';
import {wscommand} from '@/assets/js/ws/command.js';
import FriendIndex from '@/mixins/friendindex.js';//好友列表
export default {
    props:['pcarshow','gcarshow'],
    data(){
        return {
            tocardshow:false,//确认分享名片弹框
            cardInfo:{},//选择分享好友信息
            orgMyGroupList:[],//群名片-我的群列表-原始群列表
            groupCardFilter:[],//群名片-我的群列表-筛选后群列表
            gcardsearch:'',//群列表搜索值
            sharetype:1,//1：好友名片分享 2：群聊名片分享
            loading:false,
            friendscrollid:'friendListCard',//好友列表滚动id
        }
    },
    computed:{
        ...mapState({
            chatOn:state=>state.Ws.chatOn,//当前会话id
            chatinfo:state=>state.Ws.chatInfo,//会话详情
            isGroup:state=>state.Ws.isGroup,//当前会话-是否为群聊
        }),
    },
    mixins:[FriendIndex],
    watch:{
        pcarshow(nv){
            if(nv){
                this.initFriend();
                this.getMyFriendList();
            }else{
                $(".iconIMweb_grcard").removeClass("icon_select"); // 移除点击后的样式 
            }
        },
        gcarshow(nv){
            if(nv){
                this.initGroupList()
                this.getGroup();
            }else{
                $(".iconIMweb_qcard").removeClass("icon_select"); // 移除点击后的样式 
            }
        }
    },
    methods:{
        /** 重置群聊列表数据 */
        initGroupList(){
            let resetData={
                tocardshow:false,//确认分享名片弹框
                cardInfo:{},//选择分享好友信息
                orgMyGroupList:[],//群名片-我的群列表-原始群列表
                groupCardFilter:[],//群名片-我的群列表-筛选后群列表
                gcardsearch:'',//群列表搜索值
                sharetype:1,//1：好友名片分享 2：群聊名片分享
                loading:false,
                friendscrollid:'friendListCard',//好友列表滚动id
            };
            Object.assign(this.$data,resetData);//重置数据
        },
        /* 阻止冒泡 */
        stopProp(){
        },
        
        /* 关闭弹框 */
        closeDialog(){
            this.$emit("update:pcarshow",false);
            this.$emit("update:gcarshow",false);
        },
        /* 显示名片 */
        showCard(item,type){
            this.sharetype=type;
            this.cardInfo = {
                name: item.name||item.nick,
                toavatar: resUrl(item.avatar),
                uid:item.uid,
                groupid: item.groupid,
            };
            this.tocardshow=true;
        },
        /* 取消分享 */
        cancleToShare(){
            this.tocardshow=false;
        },
         /* 确定发送群名片|好友名片 */
        sureSendCard(){
            this.loading=true;
            let sendreq={};
            if(this.sharetype==1){
                sendreq={
                    chatlinkid:this.chatOn,
                    cardid:this.cardInfo.uid,
                    cardtype:1
                };
            }else{
                sendreq={
                    chatlinkid:this.chatOn,
                    cardid:this.cardInfo.groupid,
                    cardtype:2//1:个人名片 2：群名片
                };
            }
            if(this.isGroup){
                wsSend(wscommand.WxGroupChatReq,sendreq);
            }else{
                wsSend(wscommand.WxFriendChatReq,sendreq);
            }
            this.tocardshow=false;
            this.loading=false;
            document.documentElement.click();
            
        },
        /* 获取群列表 */
        async getGroup(){
            this.orgMyGroupList=await this.getMyGroupList();//我的群列表
            this.groupCardFilter=[...this.orgMyGroupList];
            this.$nextTick(() => {
                defineScroll($("#groupListCard"));
            })
        },
        /* 获取所有的群聊 */
        async getMyGroupList(){
            let postdata={
                mode:2,
            };
            let list=[];
            let res=await chatcom.chatMailList(postdata);
            if(!res.ok){
                msgTips(res.msg);
                return;
            }
            let mailData=res.data;
            if(mailData){
                list=mailData.group;
                list.map(item=>{
                    item.avatar=resUrl(item.avatar);//头像
                });
            }
            return list;
        },
        /* 群名片-群聊搜索 */
        groupQuerylist(){
            let reg=new RegExp(`${this.gcardsearch}`, 'gi');
            let data=[];
            let filterData=[...this.orgMyGroupList];
            filterData.forEach(function(item){
                reg.lastIndex=0;
                if(reg.test(item.name)){
                    data.push(item);
                }
            });
            this.groupCardFilter=data;
        },
    }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/home/msglist.less";
@import "~@/assets/style/less/components/home/sharecard.less";
</style>