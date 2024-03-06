<template>
  <div class="groupmodel">
    <!-- 退出群聊 -->
    <Dialog v-show="type == 'outgroup'">
      <div class="modelbody">
        <div class="maintitle">
          <p>确定退出当前群聊？</p>
          <p class="smtitle">退出后将不再接收此群消息</p>
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="cancleModel">取消</button>
          <button class="primarybtn" @click="sureOutGroup(groupInfo.id)" :disabled="loading">
            确定
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 解散群聊 -->
    <Dialog v-show="type == 'delgroup'">
      <div class="modelbody">
        <div class="maintitle">
          <p>确定解散群聊吗？</p>
          <p class="smtitle">解散后，所有与群有关的记录都将被删除</p>
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="cancleModel">取消</button>
          <button class="primarybtn" @click="sureDelGroup" :disabled="loading || deltime > 0">
            确认解散{{ deltime == 0 ? "" : "(" + deltime + ")" }}
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 查看群公告 -->
    <Dialog v-show="type == 'groupnotice'">
      <div class="modelbody groupnotice">
        <div class="title">
          <label>群公告</label>
          <i class="iconfont iconIMweb_cancel_cancel" @click="cancleModel"></i>
        </div>
        <div class="notice-content">
          <p class="notice-time">
            {{ groupInfo.noticetime ? "(" + groupInfo.noticetime + ")" : "" }}
          </p>
          <div class="info-notice">{{ groupInfo.notice || "暂无群公告" }}</div>
        </div>
      </div>
    </Dialog>
    <!-- 查看群简介 -->
    <Dialog v-show="type == 'groupintro'">
      <div class="modelbody groupnotice">
        <div class="title">
          <label>群简介</label>
          <i class="iconfont iconIMweb_cancel_cancel" @click="cancleModel"></i>
        </div>
        <div class="notice-content">
          <div class="info-notice">{{ groupInfo.intro || "暂无群简介" }}</div>
        </div>
      </div>
    </Dialog>
    <!-- 编辑群公告 -->
    <Dialog v-show="type == 'editnotice'">
      <div class="modelbody groupnotice">
        <div class="title">
          群公告
        </div>
        <div class="areacontainer">
          <textarea maxlength="500" v-model="notice" placeholder="请填写群公告"></textarea>
          <p class="num-count">{{ notice.length }}/500</p>
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="cancleModel">取消</button>
          <button class="primarybtn" @click="updateNotice" :disabled="loading">
            保存
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 编辑群简介 -->
    <Dialog v-show="type == 'editintro'">
      <div class="modelbody groupnotice">
        <div class="title">
          群简介
        </div>
        <div class="areacontainer">
          <textarea maxlength="500" v-model="intro" placeholder="请填写群简介"></textarea>
          <p class="num-count">{{ intro.length }}/500</p>
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="cancleModel">取消</button>
          <button class="primarybtn" :disabled="loading" @click="updateIntro">
            保存
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 修改群昵称 -->
    <Dialog v-show="type == 'editnick'">
      <div class="modelbody editnick">
        <p class="title">我的群昵称</p>
        <div class="groupipt">
          <input maxlength="30" v-model="nick" placeholder="我的群昵称" />
          <p class="num-count">{{ nick ? nick.length : 0 }}/30</p>
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="cancleModel">取消</button>
          <button class="primarybtn" :disabled="loading" @click="updateGroupNick">
            保存
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 关闭群成员邀请 -->
    <Dialog v-show="type == 'closeinvit'">
      <div class="modelbody">
        <div class="maintitle">
          <p>确定关闭成员邀请吗？</p>
          <p class="smtitle">关闭后成员将不能邀请其他人加入群聊</p>
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="cancleModel">取消</button>
          <button class="primarybtn" @click="sureCloseInvit" :disabled="loading">
            确定
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 群成员右键弹框 -->
    <ContextMenu :show="contextmenushow" :contextmenu="contextmenu" :groupInfo="groupInfo" :cmenutype="cmenutype" :isFriend="isFriend" @userApply="userApply" :isforbidden="isforbidden"></ContextMenu>
    <!-- 个人名片 -->
    <UserCard :show.sync="cardshow" :userCard="userCard" ref="usercard"></UserCard>
    <!-- 转让群主 -->
    <Dialog v-show="type == 'transgroup'">
      <div class="modelbody transContent">
        <p class="trans-title">
          <span>选择新群主</span>
          <i class="iconfont iconIMweb_cancel_cancel closeicon" @click="cancleModel"></i>
        </p>
        <p class="tm-search-friend">
          <i class="iconfont iconIMweb_search"></i>
          <input type="text" autocomplete="off" placeholder="请输入昵称" class="tm-search-input" @input="memberQuerylist" v-model="transval" />
        </p>
        <div id="transOwnerList" class="transbody">
          <ul class="transmemebers card-content">
            <div v-if="shownodata && filterMemberList.length == 0" class="nodata-content">
              <img src="~@/assets/imgs/common/nodata.png" class="search-nodata" />
              <p class="search-nodata_tips">抱歉，没有找到相关信息</p>
            </div>
            <li class="trans-col flexbox cursor" v-for="item in filterMemberList" :key="item.uid" @click="transRowClick(item)">
              <el-image class="trans-col_img" :src="item.avatar">
                <div slot="error" class="image-slot">
                  <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
                </div>
              </el-image>
              <span v-html="brightenKeyword(item.nick, transval)"> </span>
            </li>
          </ul>
        </div>
      </div>
    </Dialog>
    <!-- 确定转让群主 -->
    <Dialog v-show="trans.show">
      <div class="modelbody">
        <div class="maintitle">
          <p>
            确定选择<span class="trans-user">"{{ trans.data.nick }}"</span>为新群主？
          </p>
          <p class="smtitle">您将自动转为普通成员</p>
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="cancleTrans">取消</button>
          <button class="primarybtn" @click="sureTransGroup" :disabled="loading">
            确定
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 删除群成员 -->
    <Dialog v-show="type == 'delmember' || type == 'addmember'">
      <div class="modelbody transcontainer">
        <p class="title">
          <label class="trans-title">{{
            type == "addmember" ? "添加好友" : "删除好友"
          }}</label>
          <i class="iconfont iconIMweb_cancel_cancel" @click="cancleModel"></i>
        </p>
        <div class="trans-body">
          <div class="trans-left">
            <div class="fillheight" v-if="type == 'addmember'">
              <div class="search-content">
                <i class="iconfont iconIMweb_search"></i>
                <input type="text" placeholder="搜索" class="search-input" @input="searchApply(applyval)" v-model="applyval" />
              </div>
              <div class="trans-list" id="addMemberlist">
                <div>
                  <ul>
                    <div v-if="shownodata && addFriendList.length == 0" class="nodata-content">
                      <img src="~@/assets/imgs/common/nodata.png" class="search-nodata" />
                      <p class="search-nodata_tips">抱歉，没有找到相关信息</p>
                    </div>
                    <div v-for="v in addFriendList" :key="v.index">
                      <p class="letter-index">{{ v.index }}</p>
                      <div>
                        <li class="trans-row" v-for="item in v.data" :key="item.uid" @click="delMemberClick(item.uid)">
                          <el-image class="row-avatar" :src="item.avatar">
                            <div slot="error" class="image-slot">
                              <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
                            </div>
                          </el-image>
                          <span class="row-name" v-html="
                              brightenKeyword(
                                item.remarkname || item.nick,
                                membval
                              )
                            ">
                          </span>
                          <span class="tm-checkbox">
                            <input type="checkbox" :value="item.uid" v-model="delArr" />
                          </span>
                        </li>
                      </div>
                    </div>
                  </ul>
                </div>
              </div>
            </div>
            <div class="fillheight" v-if="type == 'delmember'">
              <div class="search-content">
                <i class="iconfont iconIMweb_search"></i>
                <input type="text" placeholder="搜索" class="search-input" v-model="membval" @input="memberQuerylist" />
              </div>
              <div class="trans-list" id="group-member-list">
                <div>
                  <ul>
                    <div v-if="shownodata && filterMemberList.length == 0" class="nodata-content">
                      <img src="~@/assets/imgs/common/nodata.png" class="search-nodata" />
                      <p class="search-nodata_tips">抱歉，没有找到相关信息</p>
                    </div>
                    <li class="trans-row" v-for="item in filterMemberList" :key="item.uid" @click="item.grouprole==2?delMemberClick(item.uid):''">
                      <el-image :src="item.avatar" class="row-avatar">
                        <div slot="error" class="image-slot">
                          <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
                        </div>
                      </el-image>
                      <p class="row-name" v-html="brightenKeyword(item.nick, membval)"></p>
                      <span class="tm-checkbox">
                        <input type="checkbox" :value="item.uid" v-model="delArr" v-show="item.grouprole==2" />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="trans-right-list">
            <p class="choose-title clearfloat">
              <span>请勾选要{{ type == "addmember" ? "添加" : "删除" }}的联系人{{
                  delArr.length > 0 ? "(" + delArr.length + ")" : ""
                }}</span>
              <button class="primarybtn" :disabled="delArr.length > 0 ? false : true" @click="sureDelMember" v-if="type == 'delmember'">
                删除
              </button>
              <button class="primarybtn" :disabled="delArr.length > 0 ? false : true" @click="sureAddMember" v-if="type == 'addmember'">
                增加
              </button>
            </p>
            <div id="del-choosed-list" class="trans-choosed-list">
              <ul>
                <li class="trans-row" v-for="choosed in delChoosedList" :key="choosed.uid">
                  <el-image :src="choosed.avatar" class="row-avatar">
                    <div slot="error" class="image-slot">
                      <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
                    </div>
                  </el-image>
                  <p class="row-name">{{ choosed.nick }}</p>
                  <i class="iconfont iconttubiao_cha" @click="cancleDelCoosed(choosed.uid)"></i>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
    <!-- 确定删除已选群成员 -->
    <Dialog v-show="delmembershow">
      <div class="modelbody">
        <div class="singletitle">
          确定要删除已选的{{ delArr.length }}位成员？
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="cancleDelMemb">
            取消
          </button>
          <button class="primarybtn" @click="delChoosedMember" :disabled="loading">
            确定
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 解除禁言 -->
    <Dialog v-show="type == 'relieveProhibit' || type=='prohibit'">
      <div class="modelbody">
        <div class="singletitle">
          确定要{{type=='prohibit'?'全体':'解除'}}禁言吗？
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="cancleModel">
            取消
          </button>
          <button class="primarybtn" @click="type=='prohibit'?sureForbidden():surerRelieveForbidden()" :disabled="loading">
            确定
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 群主审核 - 邀请理由  -->
    <Dialog v-show="modifyReviewShow">
      <div class="modelbody modifyReview-modelbody">
        <div class="reviewTips">
          群主已开启邀请审核，邀请好友进群可说明邀请理由
        </div>
        <div class="content">
          <el-input class="inviteReason" v-model="inviteReason" placeholder="邀请理由" maxlength=10></el-input>
          <span class="wordLimit">{{inviteReason.length}}/10</span>
        </div>
        <div class="button-group">
          <button class="primarybtn default" @click="modifyReviewShow=false,inviteReason = ''">
            取消
          </button>
          <button class="primarybtn" @click="inviteReasonClick">
            确定
          </button>
        </div>
      </div>
    </Dialog>
    <!-- 群主审核 - 处理审核 -->
    <Dialog v-show="auditProcessing">
      <div class="modelbody auditProcessing-modelbody">
        <i class="iconfont iconIMweb_cancel_cancel cursor" @click="auditProcessing=false"></i>
        <div class="header">
          <el-image :src="groupApplyObj.apply.groupavator" class="invitees_avatar">
            <div slot="error" class="image-slot">
              <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
            </div>
          </el-image>
          <p class="invitees_nick">{{groupApplyObj.apply.srcnick}}</p>
          <p>邀请{{groupApplyObj.items.length}}位朋友进群</p>
          <p class="invitees_reasons">{{groupApplyObj.apply.applymsg}}</p>
        </div>
        <div :class="['content',groupApplyObj.items.length<=6?'flexCenter':'flexStart']">
          <div class="user_item" v-for="(item,index) in groupApplyObj.items" :key="index">
            <div class="row-avatar">
              <el-image :src="item.avatar" class="row-avatar">
                <div slot="error" class="image-slot">
                  <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
                </div>
              </el-image>
            </div>
            <p>{{item.nick}}</p>
          </div>
        </div>
        <div class="button-group" v-show="groupApplyObj.groupApply.apply.status==2">
          <button class="primarybtn default" @click="auditProcessing=false">
            忽略
          </button>
          <button class="primarybtn" @click="agreeToAudit(groupApplyObj.groupApply)">
            同意邀请
          </button>
        </div>
        <div class="button-group" v-show="groupApplyObj.groupApply.apply.status==1">
          <button class="primarybtn" @click="agreeToAudit" :disabled="true">
            已同意
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
<script>
import { mapState, mapMutations,mapActions } from "vuex"
import { friend, group, msgTips } from "@/axios/path"
import {
  defineScroll,
  resUrl,
  debounce,
  setContextmenu,
} from "@/assets/js/common"
import ContextMenu from "@/components/home/ContextMenu" //右键操作框
import UserCard from "@/components/UserCard" //个人名片
import UserCardMixins from "@/mixins/usercard.js" //个人信息卡片
import AddGroupFd from "@/mixins/addgroupfd.js" //拉取好友进群逻辑
export default {
  props: ["type", "groupInfo", "groupUser","removeInfo","groupApplyInfo"],
  data() {
    return {
      notice: "", //群公告
      intro: "", //群简介
      nick: "", //群昵称
      isFriend: false,
      isforbidden: false,
      contextmenushow: false,
      contextmenu: {
        //会话列表右键
        top: 0,
        left: 0,
        data: {},
      },
      cmenutype: "gavatar", //右键类型
      loading: false,
      deltime: 5, //解散群聊-确定按钮倒计时
      deltimer: "", //计时器
      transval: "", //转让群聊搜索值
      filterMemberList: [], //筛选群成员列表
      member: {
        //群成员列表
        pagenum: 1, //页码
        totalPage: 1, //总页数
        totalRow: 1, //群成员总人数
      },
      trans: {
        //转让群主确认弹框
        show: false,
        data: {},
      },
      delChoosedList: [], //删除群成员-被选中列表
      delArr: [], //删除群成员-选中id
      membval: "", //删除群成员-搜索词
      delmembershow: false, //删除确认弹框
      shownodata: false,
      prohibitShow:false,//禁言
      prohibitData:{
          mode:4,
          oper:1
      },
      groupid:"",
      inviteReason:'',//邀请理由
      modifyReviewShow:false,// 邀请理由弹窗
      auditProcessing:false,//处理审核弹窗
      groupApplyObj:{// 申请入群信息
        apply:{},
        items:{},
        groupApply:{
          apply:{}
        }
      }
    }
  },
  components: { 
    ContextMenu,
    UserCard,
  },
  computed: {
    ...mapState({
      curruid: (state) => state.User.currUid,
      applyThis: (state) => state.Ws.applyThis,
    }),
  },
  mixins: [UserCardMixins, AddGroupFd],
  watch: {
    type(nv) {
      if (nv) {
        switch (nv) {
          case "editintro":
            this.intro = this.groupInfo.intro
            break
          case "editnotice":
            this.notice = this.groupInfo.notice
            break
          case "editnick":
            this.nick = this.groupUser.groupnick
            break
          case "delgroup":
            this.deltime = 5
            clearInterval(this.deltimer)
            this.deltimer = setInterval(() => {
              --this.deltime
              if (this.deltime == 0) {
                clearInterval(this.deltimer)
              }
            }, 1000)
            break
          case "transgroup":
            this.transval = ""
            this.memberQuerylist()
            break
          case "delmember":
            this.delChoosedList = []
            this.delArr = []
            this.membval = ""
            this.memberQuerylist()
            break
          case "addmember":
            this.initApplyFd()
            break
        }
      }
    },
    auditProcessing(nv){
      if(nv){
          this.groupApplyObj = this.groupApplyInfo
      }
    }
  },
  methods: {
    ...mapMutations(["setGroupMore"]),
    cancleModel() {
      if (this.type == "delgroup") {
        clearInterval(this.deltimer)
      }
      this.$emit("update:type", "")
    },
    /* 高亮 */
    brightenKeyword(val, keyword) {
      val = val + ""
      if (val.indexOf(keyword) !== -1 && keyword !== "") {
        return val.replace(
          keyword,
          '<font class="keywordcolor">' + keyword + "</font>"
        )
      } else {
        return val
      }
    },
    /* 确定退出群聊 */
    sureOutGroup(groupid) {
      this.loading = true
      let ptdata = { groupid: groupid, uid: this.curruid }
      group.leaveGroup(ptdata).then((res) => {
        if (res.ok) {
          this.cancleModel()
          this.$parent.groupSet = false
        } else {
          msgTips(res.msg)
        }
        this.loading = false
      })
    },
    /* 确定解散群聊 */
    sureDelGroup() {
      this.loading = true
      let ptdata = { groupid: this.groupInfo.id, uid: this.curruid }
      let currpath = this.$route.path
      group.delGroup(ptdata).then((res) => {
        if (res.ok) {
          this.cancleModel()
          msgTips("解散成功")
          this.$parent.groupSet = false
          if (currpath == "/home") {
            this.setGroupMore(false)
          }
        } else {
          msgTips(res.msg)
        }
        this.loading = false
      })
    },
    /* 保存群公告 */
    updateNotice() {
      this.loading = true
      let ptdata = {
        notice: this.notice,
        groupid: this.groupInfo.id,
      }
      group.modifyNotice(ptdata).then((res) => {
        if (res.ok) {
          this.cancleModel()
          this.groupInfo.notice = this.notice
          msgTips("保存成功")
        } else {
          msgTips(res.msg)
        }
        this.loading = false
      })
    },
    /* 保存群简介 */
    updateIntro() {
      this.loading = true
      let ptdata = {
        intro: this.intro,
        groupid: this.groupInfo.id,
      }
      group.modifyIntro(ptdata).then((res) => {
        if (res.ok) {
          this.cancleModel()
          this.groupInfo.intro = this.intro
          msgTips("保存成功")
        } else {
          msgTips(res.msg)
        }
        this.loading = false
      })
    },
    /* 保存我的群昵称 */
    updateGroupNick() {
      this.loading = true
      let ptdata = {
        nick: this.nick,
        groupid: this.groupInfo.id,
      }
      group.modifyGroupNick(ptdata).then((res) => {
        if (res.ok) {
          this.cancleModel()
          this.groupUser.groupnick = this.nick
          msgTips("保存成功")
        } else {
          msgTips(res.msg)
        }
        this.loading = false
      })
    },
    /* 右键 */
    async chatContextMenu(e, v) {
      log('groupModel')
      let uid = v.uid
      this.isFriend = await friend.isMyFriend(uid)
      // if(v.selfGrouprole==''||v.selfGrouprole==undefined){
      //     v.selfGrouprole = v.grouprole // 群聊中个人角色
      // }
        let postdata = {
          uid,
          groupid: this.groupInfo.id,
        }
        let forRes = await group.chatForbiddenFlag(postdata)
        if (forRes.ok) {
          this.isforbidden  = forRes.data
          v.forbiddenInfo = forRes.data
        }
      v.selfGrouprole = this.groupUser.grouprole //群聊角色
      // v.grouprole = this.groupUser.grouprole //群聊角色
      v.groupid = this.groupInfo.id
      let pos = setContextmenu(e, 130, 80)
      this.contextmenu = {
        top: pos.otop,
        left: pos.oleft,
        data: v,
      }
      this.contextmenushow = true
      this.$setAddEventListener("contextmenushow")
    },
    /* 添加好友 */
    userApply(uid) {
      this.userCard.data.id = uid
      this.$refs.usercard.applyFriend()
    },
    /* 确定关闭群成员邀请 */
    sureCloseInvit() {
      this.modifyApply(2)
    },
    /* 更改进群方式 */
    modifyApply(mode) {
      this.loading = true
      let ptdata = {
        mode: mode,
        groupid: this.groupInfo.id,
      }
      group.modifyApply(ptdata).then((res) => {
        if (res.ok) {
          this.groupInfo.applyflag = mode
          this.cancleModel()
          msgTips("修改成功")
        } else {
          msgTips(res.msg)
        }
        this.loading = false
      })
    },
    /* 群成员列表’ */
    async transGroupMember() {
      let searchkey = "",
        $scrollId
      if (this.type == "delmember") {
        searchkey = this.membval
        $scrollId = $("#group-member-list")
      }
      if (this.type == "transgroup") {
        searchkey = this.transval
        $scrollId = $("#transOwnerList")
      }
      let ptdata = {
        groupid: this.groupInfo.id,
        pageNumber: this.member.pagenum,
        searchkey: searchkey,
      }
      let res = await group.groupMember(ptdata)
      if (res.ok) {
        let data = res.data
        this.member.totalPage = data.totalPage
        this.member.totalRow = data.totalRow
        let list = data.list
        list.map((item) => {
          item.avatar = resUrl(item.avatar)
        })
        this.filterMemberList = this.filterMemberList.concat(list)
        this.shownodata = true
        if (this.member.pagenum == 1) {
          let _this = this
          this.$nextTick(() => {
            defineScroll($scrollId, "", {
              whileScrolling: function() {
                if (
                  this.mcs.topPct == 95 &&
                  _this.member.pagenum < _this.member.totalPage
                ) {
                  _this.member.pagenum++
                  _this.transGroupMember()
                }
              },
            })
          })
        }
      } else {
        msgTips(res.msg)
      }
    },
    /* 搜索群成员 */
    memberQuerylist: debounce(function() {
      this.shownodata = false
      this.member.pagenum = 1
      this.filterMemberList = []
      this.transGroupMember()
    }, 300),
    /* "转让群聊"弹框 成员点击事件 */
    transRowClick(item) {
      this.trans.data = item
      this.trans.show = true
    },
    /* 取消转让 */
    cancleTrans() {
      this.trans.show = false
    },
    /* 确认转让群聊 */
    sureTransGroup() {
      this.loading = true
      let ptdata = {
        otheruid: this.trans.data.uid,
        groupid: this.bizid || this.groupInfo.id,
      }
      group.changeOwner(ptdata).then((res) => {
        if (res.ok) {
          this.trans.show = false
          this.cancleModel()
          this.$parent.getGroupMembers()
          msgTips("转让成功")
          this.$parent.groupSet = false
        } else {
          msgTips(res.msg)
        }
        this.loading = false
      })
    },
    /* 群成员点击事件 */
    delMemberClick(uid) {
      //删除群成员群主不可选
        log(this.groupInfo)
      if (this.type == "delmember") {
      
        if (this.groupInfo.uid == uid) {
          return
        }
      }
      let findIn = this.delArr.findIndex((item) => item == uid)
      if (findIn != -1) {
        this.delChoosedList.splice(findIn, 1)
        this.delArr.splice(findIn, 1)
      } else {
        let choosedobj = {}
        let dealmember
        if (this.type == "delmember") {
          dealmember = this.filterMemberList
        }
        if (this.type == "addmember") {
          dealmember = this.orgList
          if (this.delArr.length == 50) {
            msgTips("一次最多邀请50位好友")
            return
          }
        }
        dealmember.map((item) => {
          if (item.uid == uid) {
            choosedobj = item
          }
        })

        this.delChoosedList.push(choosedobj)
        this.$nextTick(() => {
          defineScroll($("#del-choosed-list"))
        })
        this.delArr.push(uid)
      }
    },
    /* 删除选中的群成员 */
    cancleDelCoosed(id) {
      let findIn = this.delArr.findIndex((item) => item == id)
      this.delArr.splice(findIn, 1)
      this.delChoosedList.splice(findIn, 1)
    },
    /* 取消删除 */
    cancleDelMemb() {
      this.delmembershow = false
    },
    /* 确定删除 */
    sureDelMember() {
      this.delmembershow = true
    },
    /* 删除群成员 */
    delChoosedMember() {
      this.loading = true
      let postdata = {
        uids: this.delArr.join(","),
        groupid: this.groupInfo.id,
      }
      let currpath = this.$route.path
      group.kickGroup(postdata).then((res) => {
        if (res.ok) {
          this.delmembershow = false
          this.groupInfo.joinnum = this.groupInfo.joinnum - this.delArr.length
          msgTips("删除成功")
          //获取群成员
          if (currpath == "/group") {
            this.applyThis.$refs.groupinfo.getGroupMembers()
          }
          if (currpath == "/home") {
            this.$emit("getGroupMembers")
          }
        } else {
          msgTips(res.msg)
        }
        this.cancleModel()
        this.loading = false
      })
    },
    sureAddMember() {
      this.loading = true
      log(this.groupInfo)
      if(this.groupInfo.joinmode==1&&this.groupUser.grouprole==2){// 已开始群主审核
          this.modifyReviewShow = true
          return
      }
      let postdata = {
        uids: this.delArr.join(","),
        groupid: this.groupInfo.id,
      }
      let currpath = this.$route.path
      group.joinGroup(postdata).then((res) => {
        if (res.ok) {
          this.cancleModel()
          this.groupInfo.joinnum = this.groupInfo.joinnum + this.delArr.length
          msgTips("添加成功")
          //获取群成员
          if (currpath == "/group") {
            this.applyThis.$refs.groupinfo.getGroupMembers()
          }
          if (currpath == "/home") {
            this.$emit("getGroupMembers")
          }
        } else {
          msgTips(res.msg)
        }
        this.loading = false
      })
    },
    /**全员禁言 - 按钮 */
    sureForbidden(){
        let data = this.prohibitData
            data.oper = 1
            data.groupid = this.groupInfo.id
            log(this.groupInfo.id)
        group.chatForbidden(data).then(res=>{
          if(res.ok){
            msgTips('禁言成功')
            this.groupInfo.forbiddenflag = 1
            this.cancleModel()
          }else{
            msgTips(res.msg);
          }
        })
    },
    /**全员禁言- 解禁 */
    surerRelieveForbidden(){
        let data = this.prohibitData
            data.groupid = this.groupInfo.id
            data.oper = 2
            log(this.groupInfo.id)
        group.chatForbidden(data).then(res=>{
            if(res.ok){
                msgTips('解除禁言成功')
                this.groupInfo.forbiddenflag = 2
                this.cancleModel()
            }else{
                msgTips(res.msg);
            }
        })
    },
    /**邀好友进群-申请理由 */
    inviteReasonClick(){
        if(this.inviteReason==''){
            msgTips('请填写邀请理由');
            return
        }
        let postdata = {
          uids: this.delArr.join(","),
          groupid: this.groupInfo.id,
          applymsg: this.inviteReason
        }
        group.joinGroupApply(postdata).then(res=>{
            if(res.ok){
                msgTips('申请入群成功')
                this.cancleModel()
                this.modifyReviewShow = false
                this.inviteReason = ''
            }else{
                msgTips(res.msg);
            }
        })
    },
    /**同意审核 */
    agreeToAudit(item){
      let postdata = {
        mid:item.mid,
        aid:item.apply.id
      }
      group.dealGroupApply(postdata).then(res=>{
          if(res.ok){
              msgTips('成功');
              this.auditProcessing=false
              this.groupApplyObj.groupApply.apply.status = 1
          }else{
              msgTips(res.msg);
          }
      })
    }
  },
}
</script>
<style lang="less" scoped>
@import '~@/assets/style/less/components/home/transmsg.less';
@import '~@/assets/style/less/components/group/groupmodel.less';
</style>
