<template>
    <div class="more-body">
        <div class="white-mask" v-show="groupmore" @click="closeGroupMore"></div>
        <div class="morecontent" v-show="groupmore">
          <!-- tab -->
            <div class="group_tab">
              <ul class="group_tab_list cursor">
                <li :class="['group_tab_item',tabIndex==index?'tab_select':'']" 
                v-for="(item,index) in tabList" :key="index" @click="tabClick(index)">
                  {{item.title}}
                  <p></p>
                </li>
              </ul>
              <img src="~@/assets/imgs/group/receive.png" alt="" srcset="">
            </div>
            <!-- 群信息 -->
            <div v-show="tabIndex===0" class="groupcontainer">
                <div class="group_info">
                    <div class="groupInfo-avatar">
                      <el-image class="info-avatar" :src="groupInfo_avatar">
                        <div slot="error" class="image-slot">
                          <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
                        </div>
                      </el-image>
                      <span v-show="groupUser.grouprole==1||groupUser.grouprole==3" class="hoverblack" @click="showUpdateInfo(2)"></span>
                      <img v-show="groupUser.grouprole==1||groupUser.grouprole==3"  src="~@/assets/imgs/common/upload.png" class="hover-icon" @click="showUpdateInfo(2)" />
                    </div>
                    <p class="groupInfo_name cursor info-row" @click="editGroupName">{{groupInfo_name}}
                        <i class="iconfont iconttubiao_bianji edit" v-show="groupUser.grouprole==1||groupUser.grouprole==3" @click="editGroupName"></i>
                    </p>
                    <div class="icon_share cursor" @click="shareGroup(groupInfo)"><p></p></div>
                    <div class="icon_qr cursor" @click="showQrCode"><p></p></div>
                </div>
                <div class="groupInfo_content">
                    <p class="info-row">
                        <label class="info-label">群人数</label>
                        <span class="info-content" @click="goMemberTab">{{member.totalRow}}人</span>
                    </p>
                    <p class="info-row">
                        <label class="info-label">群简介</label>
                        <span class="info-content" @click="showModel(groupUser.grouprole==1||groupUser.grouprole==3?'editintro':'groupintro')">{{groupInfo.intro||'暂无群简介'}}</span>
                        <i class="iconfont iconttubiao_bianji edit" v-if="groupUser.grouprole==1||groupUser.grouprole==3" @click="showModel('editintro')"></i>
                    </p>
                    <p class="info-row">
                        <label class="info-label">群公告</label>
                        <span class="info-content" @click="showModel(groupUser.grouprole==1||groupUser.grouprole==3?'editnotice':'groupnotice')">{{groupInfo.notice||'暂无群公告'}}</span>
                        <i class="iconfont iconttubiao_bianji edit" v-if="groupUser.grouprole==1||groupUser.grouprole==3" @click="showModel('editnotice')"></i>
                    </p>
                    <p class="info-row">
                        <label class="info-label">群主</label>
                        <span class="info-content no-cursor">{{groupInfo.nick}}</span>
                    </p>
                    <p class="info-row">
                        <label class="info-label">本群昵称</label>
                        <span class="info-content" @click="showModel('editnick')">{{groupUser.groupnick}}</span>
                        <i class="iconfont iconttubiao_bianji edit"  @click="showModel('editnick')"></i>
                    </p>
                    <p class="info-row">
                        <label class="info-label">消息免打扰</label>
                        <label class='tioim-switch' @click="changeInvit('freeflag')">
                            <span :class="['switch-span',groupUser.msgfreeflag==1?'checked':'']"></span>
                        </label>
                        <span class="apply-status">{{groupUser.msgfreeflag==1?'免打扰':'正常'}}</span>
                    </p>
                    <!-- <p class="info-row">
                        <label class="info-label">消息置顶</label>
                        <label class='tioim-switch' @click="changeInvit">
                            <span :class="['switch-span',groupInfo.applyflag==1?'checked':'']"></span>
                        </label>
                        <span class="apply-status">{{groupInfo.applyflag==1?'已开启':'已关闭'}}</span>
                    </p>-->
                </div>
                <!-- <div class="group_footer ">
                    <p class="footerBtn">
                        <button class="cursor">清除聊天记录</button>
                    </p>
                </div> -->
                <div class="groupmanage_groupsBtn" v-show="!isGroupLeader">
                    <button class="cursor"  @click="showModel('outgroup')">退出群</button>
                </div>
            </div>
            <!-- 群成员 -->
            <div v-show="tabIndex===1" class="groupcontainer" >
                <div class="groupcontainer" v-show="searchshow">
                    <div class="search-in search-top">
                        <div class="search-ipt">
                            <i class="iconfont iconIMweb_search"></i>
                            <input id="group-search" type="text" placeholder="搜索群成员" v-model="searchVal" @input="memberQuerylist" />
                            <i class="iconfont iconIMweb_cancel_cancel hide-search-icon" @click="hideSearchList"></i>
                        </div>
                    </div>
                    <div class="searchlist" id="searchlist">
                        <ul>
                            <li class="trans-row" v-for="item in filterMemberList" :key="item.uid" @click.stop="showCard($event,item.uid)" @contextmenu.prevent="chatContextMenu($event,item)">
                                <el-image  :src="item.avatar" class="row-avatar">
                                    <div slot="error" class="image-slot">
                                        <img src="~@/assets/imgs/common/avatar.jpg"  @click.stop="showCard($event,item.uid)" class="error-img"/>
                                    </div>
                                </el-image>
                                <p class="row-name"  v-html="brightenKeyword((item.remarkname||item.nick),searchVal)"></p>
                                <p :class="[(item.grouprole==1||item.selfGrouprole===1)?'groupUser':(item.grouprole==3||item.selfGrouprole==3)?'groupManage':'']"></p>
                            </li>
                        </ul>
                    </div>
                </div>
                <div  v-show="!searchshow" class="group-main-info">
                    <div class="search-in search-top">
                        <div class="search-ipt">
                            <i class="iconfont iconIMweb_search"></i>
                            <input type="text" readonly placeholder="搜索群成员" @click="showSearchList"/>
                        </div>
                    </div>
                    
                    <div id="membercontent" :class="['membercontent',seemorememb?'minmember':'maxmember']">
                        <ul class="memberlist">
                            <li class="memeber-col flex_column_between_Center" v-show="groupUser.grouprole==1||groupUser.grouprole==3||groupInfo.applyflag==1">
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
                                <!-- 
                                  关闭互加好友功能时，不能查看不是好友用户信信息，除非时管理员和群主
                                 -->
                                <el-image  class="user-avatar" :src="v.avatar" @click.stop="showCard($event,v.uid)"
                                @contextmenu.prevent="chatContextMenu($event,v)">
                                    <div slot="error" class="image-slot">
                                        <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" @click.stop="showCard($event,v.uid)" @contextmenu.prevent="chatContextMenu($event,v)"/>
                                    </div>
                                </el-image>
                                <p :class="[(v.grouprole==1||v.selfGrouprole===1)?'groupUser':(v.grouprole==3||v.selfGrouprole==3)?'groupManage':'']"></p>
                                <p class="user-name">{{v.nick}}</p>
                            </li>
                        </ul>
                    </div>
                    <p class="moredown" v-show="seemorememb&&(groupUser.grouprole==1?(groupInfo.joinnum>13):(groupInfo.joinnum>14))" @click="seeMoreMember(false)">查看更多<i class="iconfont iconttubiao_jiantou"></i></p>
                    <p class="moredown moreup" v-show="!seemorememb" @click="seeMoreMember(true)">收起<i class="iconfont iconttubiao_shangla"></i></p>
                </div>            
            </div>
          <!-- 群管理 -->
          <div v-show="tabIndex===2" class="groupcontainer" >
                <div class="group-main-info group_manage">
                    <!-- 群聊信息 -->
                     <p class="info-row">
                        <label class="info-label">群内互加好友</label>
                        <label class='tioim-switch' @click="changeInvit('modifyFriendFlag')">
                            <span :class="['switch-span',groupInfo.friendflag==1?'checked':'']"></span>
                        </label>
                    </p>
                    <p class="info-row">
                        <label class="info-label">开启成员邀请</label>
                        <label class='tioim-switch' @click="changeInvit('applyflag')">
                            <span :class="['switch-span',groupInfo.applyflag==1?'checked':'']"></span>
                        </label>
                    </p>
                    <p class="info-row">
                        <label class="info-label">邀请审核</label>
                        <label class='tioim-switch' @click="changeInvit('modifyReview')">
                            <span :class="['switch-span',groupInfo.joinmode==1?'checked':'']"></span>
                        </label>
                    </p>

                    <div class="groupmanage_content">
                        <p class="info-row">
                            <label class="info-label">全员禁言</label>
                            <label class='tioim-switch' @click="allForbidden">
                                <span :class="['switch-span',groupInfo.forbiddenflag==1?'checked':'']"></span>
                            </label>
                        </p>
                        <p class="info-row">
                            <label class="info-label">禁言名单</label>
                            <label class='tioim-switch' @click="getForbiddenList">
                                <span>{{search.totalPage}}人</span>
                                <i class="iconfont iconttubiao_jiantou"></i>
                            </label>
                        </p>
                        <div class="groupmanage_groupsBtn">
                            <button class="cursor"  @click="showModel('outgroup')">退出群</button>
                            <button class="cursor" @click="showModel('delgroup')" v-show="groupUser.grouprole==1">解散群</button>
                            <button class="cursor" @click="showModel('transgroup')" v-show="groupUser.grouprole==1">转让群</button>
                        </div>
                    </div>
                </div>            
            </div>
        </div>
        <!-- 群聊相关弹框 -->
        <GroupModel ref="groupmodel" :type.sync="grouptype" :groupInfo="groupInfo" :groupUser="groupUser" :removeInfo="removeInfo" @getGroupMembers="getGroupMembers"></GroupModel>
        <!-- 修改群名称 -->
        <GroupName :show.sync="editname" :name.sync="groupname" :groupid="groupInfo.id" @saveSuccessName="saveSuccessName"></GroupName>
        <!-- 修改图片 -->
        <GroupAvatar :infoshow.sync="infoshow" :userinfo="groupInfo" :type="infotype" v-on:groupAvatar="groupAvatar"></GroupAvatar>
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
        <!-- 分享群聊 -->
        <TransMsg :transShow.sync="sendShow" :transType="sendType" :transData="data" :setid="setid"></TransMsg>
        <!-- 群二维码 -->
        <qrCode :infoQrCode.sync="infoQrCode" :codeValue="codeValue" :user_avatar="user_avatar" :currUser="groupInfo" :qrmsg="qrmsg" @hideInfoQrCode="hideInfoQrCode"></qrCode>
        </div>
</template>
<script>
import { mapState, mapMutations ,mapActions} from 'vuex';
import GroupModel from "@/components/group/GroupModel";//群聊相关弹框
import GroupInfo from '@/mixins/groupinfo.js';//群成员列表
import GroupName from '@/components/GroupName';//群名称弹框
import {group,msgTips,friend} from '@/axios/path';
import {defineScroll,resUrl,debounce} from '@/assets/js/common';
import GroupAvatar from '@/components/GroupAvatar';//当前用户信息操作
import TransMsg from "@/components/home/TransMsg";//转发消息
import qrCode from "@/components/qrCode";//二维码
export default {
    props:['show'],
    data(){
        return {
            groupid:'',
            seemorememb:true,//查看更多群成员
            editname:false,//编辑群名称
            groupname:'',//群名称
            searchshow:false,//搜索群成员
            searchVal:'',//搜索群成员关键词
            filterMemberList:[],//搜索群成员列表
            smember:{//搜索群成员列表
                pagenum:1,//页码
                totalPage:1,//总页数
                totalRow:1,//群成员总人数
                totalPage:0
            },
            tabList:[],//tab列表
            tabIndex:0,
            groupInfo_name:"",//群名称
            groupInfo_avatar:"",//群头像
            prohibitShow:false,
            forbiddenListShow:false,
            removeInfo:{},//移除禁言人员信息

            searchValue:"",//搜索值
            searchResult:false,//“用户不存在”布局是否显示
            search:{
                pagenum:1,
                totalPage:0
            },
            searchData:[],
            forbiddenList:false,
            setid:'share',//分享名片弹框id避免同页面重复id问题
            searchShow:false,//搜索显示状态
            sendShow:false,//发送名片弹框显示状态
            sendShow:false,//发送名片弹框显示状态
            sendType:3,
            data:{},
            infoQrCode:false,
            codeValue:'', // 二维码内容
            user_avatar:'',//二维码头像
            qrmsg:"扫码加入群聊",
            isGroupLeader:false,//是否为群主
            totalRowCount:0,
            infoshow:false,
            infotype:''
        }
    },
    watch:{
        async groupmore(nv){
            if(nv){
                this.groupid=this.bizId;
                await this.getGroupInfo();
                this.getGroupMembers();
                this.groupInfo_avatar = resUrl(this.groupInfo.avatar)
                if(this.groupUser.grouprole==1||this.groupUser.grouprole==3){ //判断是否为群主或管理员
                    this.tabList = [
                        {
                          title:"群信息",
                        },
                        {
                          title:"群成员",
                        },
                          {
                          title:"群管理",
                        }
                    ]
                    this.isGroupLeader = true
                }else{
                    this.tabList = [
                        {
                          title:"群信息",
                        },
                        {
                          title:"群成员",
                        }
                    ]
                     this.isGroupLeader = false
                }
                this.groupInfo_name = this.groupInfo.name.length>20?this.groupInfo.name.substring(0,20)+'...':this.groupInfo.name
                
            
            }else{
              this.tabList = []
              this.tabIndex = 0
              this.filterMemberList = []
            }
        }
    },
    computed:{
        ...mapState({
            groupmore:(state)=>state.Ws.groupmore,
            curruid:(state)=>state.User.currUid,
            chatOn:state=>state.Ws.chatOn,//当前会话id
            bizId:state=>state.Ws.bizId,//当前会话-群聊groupid或私聊好友uid
            isGroup:state=>state.Ws.isGroup,//当前会话-是否为群聊
            applyThis:state=>state.Ws.applyThis,//当前页面this
            commGroupInfo:(state)=>state.CommonInfo.groupUserInfo, //群消息
        }),
    },
    components:{
        GroupModel,
        GroupName,
        GroupAvatar,
        TransMsg,
        qrCode
    },
    mixins:[GroupInfo],
    methods:{
        ...mapMutations(['setGroupMore']),
        /* 关闭群聊信息弹框 */
        closeGroupMore(){
            this.searchshow=false;
            this.seemorememb=true;
            this.setGroupMore(false);
        },
        /* 群聊名称 */
        editGroupName(){
            if(this.groupUser.grouprole==1||this.groupUser.grouprole==3){
                this.editname=true;
                this.groupname=this.groupInfo.name;
            }
        },
        /* 修改群聊名称 */
        saveSuccessName(val){
            this.groupInfo.name=val;
            this.groupInfo_name = val.length>20?val.substring(0,20)+'...':val
        },
        /* 更改群成员邀请方式 */
        changeInvit(type){
          log(type)
            if(type=='applyflag'){// 开启成员邀请
                if(this.groupInfo.applyflag==1){
                    this.showModel('closeinvit');
                }else{
                    this.openInvit();
                }
            }else if(type=='freeflag'){// 消息免打扰
                if(this.groupUser.msgfreeflag==1){
                  this.modifyGroupPush(2)
                }else{
                  this.modifyGroupPush(1)
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
        /* 查看更多群成员 */
        seeMoreMember(val){
            this.seemorememb=val;
        },
        /* 显示搜索列表 */
		    showSearchList(){
            this.smember.pagenum=1;
            this.filterMemberList=[];
            this.searchVal='';
            this.searchshow=true;
            this.getGroupMember();
             this.$nextTick(()=>{
                $("#group-search").focus();
            });
        },
        /* 隐藏搜索列表 */
        hideSearchList(){
            this.searchshow=false;
        },
        /* 搜索群成员 */
        memberQuerylist:debounce(function(){
            this.smember.pagenum=1;
            this.filterMemberList=[];
            this.getGroupMember();
        },300),
        /* 群成员列表’ */
        async getGroupMember(){
            let ptdata={
                groupid:this.groupid,
                pageNumber:this.smember.pagenum,
                searchkey:this.searchVal
            };
            let res=await group.groupMember(ptdata);
            if(res.ok){
                let data=res.data;
               
                this.smember.totalPage=data.totalPage;
                this.smember.totalRow=data.totalRow;
                this.totalRowCount = data.totalRow;
                let list=data.list;
                log(data.list)
                list.map(item=>{
                    item.avatar=resUrl(item.avatar);
                })
                this.filterMemberList=this.filterMemberList.concat(list);
                if(this.smember.pagenum==1){
                    let _this=this;
                    this.$nextTick(()=>{
                        defineScroll($("#searchlist"),'',{
                            whileScrolling:function(){
                                if(this.mcs.topPct==95&&_this.smember.pagenum< _this.smember.totalPage){
                                    _this.smember.pagenum++;
                                    _this.getGroupMember();
                                }
                            }
                        });
                    })
                }
            }else{
                msgTips(res.msg);
            }
        },
        brightenKeyword(val,keyword) {
            val = val + '';
            if (val.indexOf(keyword) !== -1 && keyword !== '') {
                return val.replace(keyword, '<font class="keywordcolor">' + keyword + '</font>')
            } else {
                return val;
            }
        },
        tabClick(e){
            this.tabIndex = e
            this.groupid=this.bizId;
            if(e===2){
              this.searchList();
            }
        },
        /* 显示-修改信息弹框 */
        showUpdateInfo(type){
            this.show=false;
            this.userinfo={...this.groupInfo};
            this.infotype=type;
            this.infoshow=true;
            
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
        },
        /**弹出移除禁言名单弹窗提示 */
        removeForbidden(item){
          this.removeInfo = item
          this.forbiddenList = true
        },
        SecondToDate: function(msd) {
            var time =msd
            if(time==0){
                time = '长期禁言'
                log('长期禁言')
                }
            else if (time > 60 && time < 60 * 60) {
                time = parseInt(time / 60.0) + "分钟"
            }
            else if (time >= 60 * 60 && time <= 60 * 60 * 24) {
                time = parseInt(time / 3600.0) + "小时"
            }
            return time;
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
        searchList(){
            let ptdata={
                pageNumber:this.search.pagenum,
                searchkey:this.searchValue,
                groupid:this.bizId,
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
                    log(this.searchData)
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
        /**分享群聊 */
        async shareGroup(item){
            let ptdata={groupid:item.id};
            let res=await group.checkSendCard(ptdata);//校验是否可以分享群聊
            if(!res.ok){
                msgTips(res.msg);
                return;
            }
            var data = {
                avatar:resUrl(item.avatar),
                name:item.name,
                groupid:item.id,
                uid:item.uid
            }
            this.data = data
            this.sendShow = true
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
        /**点击群人数跳转群成员tab */
        goMemberTab(){
            this.tabIndex = 1
        },
        /* 删除单个群成员 */
        afterDelGroup(uid){
            let findex=this.groupMember.findIndex(item=>item.uid==uid);
            this.groupMember.splice(findex,1);
            this.groupInfo.joinnum--;
            //左侧群聊的人数
            (this.applyThis.$refs.grouplist.groupList.find(item=>item.groupid==this.groupid)).joinnum= this.groupInfo.joinnum;
        },
        /**展示用户名片 */
       async showCard(e,uid){
           let isfriend= await friend.isMyFriend(uid);
          // 关闭互加好友功能时，不能查看不是好友用户信信息，除非时管理员和群主
          if(this.groupInfo.friendflag==2){
            if(isfriend==2&&(this.groupUser.grouprole==1||this.groupUser.grouprole==3)){
              this.showUserCard(e,uid)
            }else if(isfriend==1){
              this.showUserCard(e,uid)
            }
          }else{
            this.showUserCard(e,uid)
          }
        },
        /**获取重新上传的群头像 */
        groupAvatar: function (groupAvatar) {
          // groupAvatar就是子组件传过来的值
          this.groupInfo_avatar = groupAvatar
        },

    },
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/search.less";
@import "~@/assets/style/less/components/home/groupmore.less";
</style>