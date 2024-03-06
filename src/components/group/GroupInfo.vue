<template>
    <div class="maincontent">
        <div class="infohead" id="infohead" v-show="hasGroup">
            <div class="head_left_box">
                <p v-show="(groupUser.grouprole==1||groupUser.grouprole==3)&&!showEditName"  class="user-name flexCenter"  @click.stop="showEditIpt">
                    <span class="overell cursor">{{groupInfo.name}}({{groupInfo.joinnum}})</span>
                    <i class="iconfont iconttubiao_bianji" v-show="groupUser.grouprole==1||groupUser.grouprole==3"></i>
                </p>
                <p class="user-name" v-show="groupUser.grouprole!=1&&groupUser.grouprole!=3">{{groupInfo.name}}({{groupInfo.joinnum}})</p>
                <div class="edit-name" v-show="showEditName"  @click.stop="stopProp">
                    <input type="text" v-model="userName" placeholder="请输入群名称" @mouseup.stop="stopProp"/>
                    <span class="edit-sure" @click="sureSaveRemark">
                    </span>
                </div>
            </div>
            <!-- <i class="iconfont iconttubiao_point" @click.stop="showGroupSet"></i> -->
           <div class="head_right_box">
                <div class="icon_qr cursor" @click="showQrCode"><p></p></div>
                <img class="icon_setup cursor" src="~@/assets/imgs/group/icon_setup.png" @click.stop="showGroupSet" alt="" srcset="">
           </div>
           <ul :class="['contextmenu-ul hjgytfnk', 'groupSet',(groupUser.grouprole==1||groupUser.grouprole==3)?'contextmenu-width':'']" v-show="groupSet&&(groupUser.grouprole==1||groupUser.grouprole==3)" style="z-index:888">
                <li>
                    <span>开启成员邀请</span> 
                    <label class='tioim-switch' @click="changeInvit('modifyApply')">
                        <span :class="['switch-span',groupInfo.applyflag==1?'checked':'']"></span>
                    </label>
                </li>
                <li>
                    <span>邀请审核</span> 
                    <label class='tioim-switch' @click="changeInvit('modifyReview')">
                        <span :class="['switch-span',groupInfo.joinmode==1?'checked':'']"></span>
                    </label>
                </li>
                <li>
                    <label class="info-label">全员禁言</label>
                    <label class='tioim-switch' @click="allForbidden">
                        <span :class="['switch-span',groupInfo.forbiddenflag==1?'checked':'']"></span>
                    </label>
                </li>
                <li>
                    <span>禁言名单</span> 
                    <label class='tioim-switch' @click="getForbiddenList">
                        <span>{{search.totalPage}}人</span>
                        <i class="iconfont iconttubiao_jiantou"></i>
                    </label>
                </li>
                <li >
                    <span>群内互加好友</span> 
                    <label class='tioim-switch' @click="changeInvit('modifyFriendFlag')">
                        <span :class="['switch-span',groupInfo.friendflag==1?'checked':'']"></span>
                    </label>
                </li>
                <div class="groupmanage_groupsBtn">
                    <button class="cursor"  @click="showModel('outgroup')">退出群</button>
                    <button class="cursor" @click="showModel('delgroup')" v-show="groupUser.grouprole==1">解散群</button>
                    <button class="cursor" @click="showModel('transgroup')" v-show="groupUser.grouprole==1">转让群</button>
                </div>
            </ul>
            <ul class="contextmenu-ul groupSet" v-show="groupSet&&groupUser.grouprole==2">
                 <div>
                    <li @click="showModel('outgroup')">退出群聊</li>
                </div>
            </ul>
        </div>
        <div class="group-container" v-show="hasGroup">
            <div id="membercontent" class="membercontent">
                <ul class="memberlist">
                     <li class="memeber-col flex_column_between_Center"  v-show="groupUser.grouprole==1||groupUser.grouprole==3||groupInfo.applyflag==1">
                        <div class="groupoper" @click="showModel('addmember')">
                            <i class="iconfont iconttubiao_addpeople"></i>
                        </div>
                        <p class="user-name">添加</p>
                    </li>
                    <li class="memeber-col flex_column_between_Center" v-show="groupUser.grouprole==1||groupUser.grouprole==3">
                        <div class="groupoper" @click="showModel('delmember')">
                            <i class="iconfont iconttubiao_Less"></i>
                        </div>
                        <p class="user-name">删除</p>
                    </li>
                 
                    <li class="memeber-col" v-for="v in groupMember" :key="v.uid"  :uid="v.uid">
                          <el-image  class="user-avatar" :src="v.avatar" @click.stop="showUserCard($event,v.uid)" @contextmenu.prevent="chatContextMenu($event,v)">
                            <div slot="error" class="image-slot">
                                <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" @click.stop="showUserCard($event,v.uid)" @contextmenu.prevent="chatContextMenu($event,v)"/>
                            </div>
                            
                          </el-image>
                          <p :class="[v.grouprole==1?'groupUser':v.grouprole==3?'groupManage':'']"></p>
                        <p class="user-name">{{v.nick}}</p>
                        
                    </li>
                </ul>
            </div>
            <div class="group-detail">
                <p class="group-row">
                    <label>群简介</label>
                    <span class="content cursor" @click="showModel('groupintro')">{{groupInfo.intro||'暂无群简介'}}</span>
                    <i class="iconfont iconttubiao_bianji edit" v-show="groupUser.grouprole==1||groupUser.grouprole==3" @click="showModel('editintro')"></i>
                </p>
                <p class="group-row">
                    <label>群公告</label>
                    <span class="content cursor" @click="showModel('groupnotice')">{{groupInfo.notice||'暂无群公告'}}</span>
                    <i class="iconfont iconttubiao_bianji edit" v-show="groupUser.grouprole==1||groupUser.grouprole==3" @click="showModel('editnotice')"></i>
                </p>
                <p class="group-row">
                    <label>群昵称</label>
                    <span>
                        <span class="content">{{groupUser.groupnick}}</span>
                        <i class="iconfont iconttubiao_bianji edit"  @click="showModel('editnick')"></i>
                    </span>
                </p>
            </div>
            <div class="group-btngroup">
                <button class="primarybtn default" @click="sendCard">分享群聊</button>
                <button class="primarybtn" @click="sendMessage(groupid)">发消息</button>
            </div>
        </div>
        <!-- 群聊相关弹框 -->
        <GroupModel ref="groupmodel" :type.sync="grouptype" :groupInfo="groupInfo" :groupUser="groupUser" :removeInfo="removeInfo"></GroupModel>
        <!-- 禁言名单 -->
        <Dialog v-show="forbiddenListShow">
            <div class="modelbody addfriend">
                <div class="title">
                    <label>禁言名单</label>
                    <i class="iconfont iconIMweb_cancel_cancel" @click="forbiddenListShow = false"></i>
                </div>
                <div class="user-search">
                    <div class="search-content">
                        <i class="iconfont iconIMweb_search"></i>
                        <input type="text" class="search-input" placeholder="输入昵称" v-model="searchValue" @keyup.enter="searchFriend">
                    </div>
                    <button class="primarybtn"  @click="searchFriend">查找</button>
                </div>
                <div class="searchUserList" id="searchUserList">
                    <ul  v-show="searchResult">
                        <li class="search-nouser nodata-content" v-if="searchData.length==0">
                            <img src="~@/assets/imgs/common/nodata.png" class="search-nodata"/>
                            <p class="search-nodata_tips">抱歉，没有找到相关信息</p>
                        </li>
                        <li class="search-row"  v-else v-for="v in searchData" :key="v.id">
                            <el-image class="search-avatar" :src="v.avatar" >
                                <div slot="error" class="image-slot" >
                                    <img src="~@/assets/imgs/common/avatar.jpg" class="error-img"/>
                                </div>
                            </el-image>
                            <div class="search-center">
                                <p class="search-nick"  v-text="v.nick"></p>
                                <p class="search-city">{{v.province}} {{v.city}}</p>
                            </div>
                            <span class="forbidden_duration cursor" @click="removeForbidden(v)">{{SecondToDate(v.forbiddenduration)}}</span>
                            <img class="icon_remove cursor" src="~@/assets/imgs/group/icon_remove.png" alt="" @click="removeForbidden(v)">
                        </li>
                    </ul>
                </div>
            </div>
        </Dialog>
        <!-- 移除禁言名单 -->
        <Dialog v-show="forbiddenList" style="z-index:1001">
          <div class="modelbody remove-modelbody">
            <div class="singletitle">
              确认将{{removeInfo.nick}}移除禁言名单？
            </div>
            <div class="button-group">
              <button class="primarybtn default" @click="forbiddenList = false">
                取消
              </button>
              <button class="primarybtn" @click="remvoeForbidden">
                确定
              </button>
            </div>
          </div>
        </Dialog>
        <!-- 群二维码 -->
        <qrCode :infoQrCode.sync="infoQrCode" :codeValue="codeValue" :user_avatar="user_avatar" :currUser="groupInfo" :qrmsg="qrmsg" @hideInfoQrCode="hideInfoQrCode"></qrCode>
        <div v-show="groupSet" class="mask" @click="groupSet=false"></div>
    </div>
</template>
<script>
import { mapState,mapMutations} from 'vuex';
import GroupModel from "@/components/group/GroupModel";//群聊相关弹框
import GroupInfo from '@/mixins/groupinfo.js';//群成员列表
import {group,msgTips} from '@/axios/path';
import {defineScroll,resUrl} from '@/assets/js/common';
import qrCode from "@/components/qrCode";//二维码
export default {
    props:['groupid'],
    data(){
        return {
            groupSet:false,
            hasGroup:false,//是否有群聊信息
            showEditName:false,
            userName:'',
            searchValue:"",//搜索值
            searchResult:false,//“用户不存在”布局是否显示
            search:{
                pagenum:1,
                totalPage:0
            },
            searchData:[],
            forbiddenList:false,//移除禁言弹窗
            forbiddenListShow:false,// 禁言弹窗
            removeInfo:{},//移除禁言人员信息
            infoQrCode:false,//二维码弹窗
            codeValue:'', // 二维码内容
            user_avatar:'',//二维码头像
            qrmsg:"扫码加入群聊",
            
        }
    },
    watch:{
        async groupid(nv){
            if(nv){
                await this.getGroupInfo();
                this.getGroupMembers();
                this.hasGroup=true;
            }else {
                this.hasGroup=false;
            }
        },
        groupSet(nv){
            if(nv){
                if(this.groupUser.grouprole==1){
                    this.searchList()
                }
            }
        },
    },
    computed:{
        ...mapState({
            applyThis:(state)=>state.Ws.applyThis,
        }),
    },
    components:{
        GroupModel,
        qrCode
    },
    mixins:[GroupInfo],
    methods:{
        ...mapMutations(['setGroupMore']),
        /* 群设置图标点击事件 */
        showGroupSet(){
            document.documentElement.click();
            this.groupSet=true;
            // this.$setAddEventListener("groupSet");
        },
        /* 群聊发送消息 */
        sendMessage(gid){
            this.$emit("sendMsg",gid);
            this.setGroupMore(false);
        },
        /* 分享群聊 */
        sendCard(){
            let groupInfo={...this.groupUser,...this.groupInfo};
            this.$emit("sendCard",groupInfo);
        },
        /* 删除单个群成员 */
        afterDelGroup(uid){
            let findex=this.groupMember.findIndex(item=>item.uid==uid);
            this.groupMember.splice(findex,1);
            this.groupInfo.joinnum--;
            //左侧群聊的人数
            (this.applyThis.$refs.grouplist.groupList.find(item=>item.groupid==this.groupid)).joinnum= this.groupInfo.joinnum;
        },
        /* 显示编辑备注输入框 */
        showEditIpt(){
            this.userName=this.groupInfo.name;
            this.showEditName=true;
        },
        /* 组织冒泡 */
        stopProp(){},
        sureSaveRemark(){
            this.loading=true;
            let ptdata={groupid: this.groupid,name: this.userName};
            if(this.userName==''){
                this.showEditName = false
                return
            }
            group.modifyName(ptdata).then(res=>{
                if(res.ok){
                    msgTips("保存成功");
                    this.groupInfo.name = this.userName
                    this.showEditName = false
                }else{
                    msgTips(res.msg);
                }
                this.loading=false;
            })
        },
        changeInvit(type){
          if(type=='modifyApply'){// 开启成员邀请
              if(this.groupInfo.applyflag==1){
                  this.showModel('closeinvit');
              }else{
                  this.openInvit();
              }
          }else if(type=='modifyReview'){// 邀请审核
              if(this.groupInfo.joinmode==1){
                  this.modifyReview(2);
              }else{
                  this.modifyReview(1);
              }
          }else if(type=='modifyFriendFlag'){// 群内互加好友
              if(this.groupInfo.friendflag==1){//关闭
                  this.modifyFriendFlag(2);
              }else{
                  this.modifyFriendFlag(1);
              }
          }
        },
        /**全员禁言 */
        allForbidden(){
            //  forbiddenflag（全员禁用：1：是；2：否）
            if(this.groupInfo.forbiddenflag==1){
                this.showModel('relieveProhibit');
            }else{
                this.showModel('prohibit');
            }
        },
        getForbiddenList(){
            this.forbiddenListShow = true
            this.groupSet = false
        },
        /* 搜索好友 */
        searchFriend(){
            this.search.pagenum=1;
            this.searchList();
        },
        /* 初始化添加好友弹框 */
        initSearchUser(){
            let resetdata={
                searchValue:'',
                searchResult:false,
                search:{
                    pagenum:1,
                    totalPage:0
                },
                searchData:[]
            };
            Object.assign(this.$data,resetdata);//重置数据
        },
        SecondToDate: function(msd) {
            var time =msd
            if(time==0){
                time = '长期禁言'
            }
            else if (time > 60 && time < 60 * 60) {
                time = parseInt(time / 60.0) + "分钟"
            }
            else if (time >= 60 * 60 && time <= 60 * 60 * 24) {
                time = parseInt(time / 3600.0) + "小时"
            }
            return time;
        },
        /**禁言人员列表 */
        searchList(){
            let ptdata={
                pageNumber:this.search.pagenum,
                searchkey:this.searchValue,
                groupid:this.groupid,
            };
            group.forbiddenUserList(ptdata).then(res=>{
                if(res.ok){
                    let data=res.data;
                    if(this.search.pagenum==1){
                        this.searchData=[];
                    }
                    if(!data){
                        this.searchResult=false;
                        return;
                    }
                    this.search.totalPage=data.totalRow;
                    // data.totalPage==0? this.searchResult=true:this.searchResult=false;
                    this.searchResult=true;
                    let list=data.list;
                    list.map(item=>{
                        item.avatar=resUrl(item.avatar);
                    })
                    this.searchData = Object.assign( [] , this.searchData , this.searchData.concat(list))
                    if(this.search.pagenum==1){
                        let _this=this;
                        this.$nextTick(()=>{
                            defineScroll($("#searchUserList"),'',{
                                whileScrolling:function(){
                                    if(this.mcs.topPct==95&&_this.search.pagenum< _this.search.totalPage){
                                        _this.search.pagenum++;
                                        _this.searchList();
                                    }
                                }
                            });
                        })
                    }
                }else{
                    msgTips(res.msg);
                }
            })
        },
        /**弹出移除禁言名单弹窗提示 */
        removeForbidden(item){
            this.removeInfo = item
            this.forbiddenList = true
        },
        /**将用户移除禁言名单 */
        remvoeForbidden(){
            let data = {},groupid = this.groupInfo.id;
                data.groupid = this.groupInfo.id
                data.uid = this.removeInfo.uid
                data.oper = 2
                data.duration = this.removeInfo.forbiddenduration
                data.mode = this.removeInfo.forbiddenflag
                group.chatForbidden(data).then(res=>{
                    if(res.ok){
                        msgTips('移除禁言名单成功')
                        this.forbiddenList = false
                        this.searchList();
                    }else{
                        msgTips(res.msg);
                    }
                })
        },
        /**展示群二维码弹窗 */
        showQrCode(){
            this.infoQrCode = true
            this.user_avatar = resUrl(this.groupInfo.avatar)
            this.codeValue = `https://a.app.qq.com/o/simple.jsp?pkgname=com.tiocloud.chat&g=${this.groupInfo.id}&applyuid=${this.groupInfo.uid}`
        },
        /**关闭群二维码 */
        hideInfoQrCode(){
            this.infoQrCode = false
        },

    }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/search.less";
@import "~@/assets/style/less/components/group/groupinfo.less";
</style>