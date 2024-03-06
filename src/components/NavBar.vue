<template>
  <div class="navbar">
    <div class="nav-top user">
      <el-image
        class="user-avatar"
        :src="currUser.avatar"
        @click.stop="showUserCard"
      >
        <div
          slot="error"
          class="image-slot"
        >
          <img
            src="~@/assets/imgs/common/avatar.jpg"
            class="error-img"
            @click.stop="showUserCard"
          />
        </div>
      </el-image>
      <!-- 用户信息 -->
      <div
        class="userinfo"
        @click.stop="stopProp"
        v-show="show"
      >
        <div class="baseinfo">
          <img
            :src="currUser.avatar"
            class="base-bg"
          />
          <div class="info-avatar">
            <el-image
              class="info-avatar"
              :src="currUser.avatar"
            >
              <div
                slot="error"
                class="image-slot"
              >
                <img
                  src="~@/assets/imgs/common/avatar.jpg"
                  class="error-img"
                />
              </div>
            </el-image>
            <span
              class="hoverblack"
              @click="showUpdateInfo(2)"
            ></span>
            <img
              src="~@/assets/imgs/common/upload.png"
              class="hover-icon"
              @click="showUpdateInfo(2)"
            />
          </div>
          <p class="user-nick">{{currUser.nick}}</p>
          <p class="user-loginname">{{currUser.loginname}}</p>
          <div
            class="qrCode"
            @click="infoQrCode=!infoQrCode"
          ></div>

        </div>
        <div class="detail-info">
          <div class="info-item">
            <label class="info-item_label">签名</label>
            <span class="info-item_col">{{currUser.sign||'暂无签名'}}</span>
          </div>
          <div class="info-item">
            <label class="info-item_label">地区</label>
            <span class="info-item_col">{{currUser.province}} {{currUser.city}}</span>
          </div>
          <div class="info-item">
            <label class="info-item_label">设置</label>
            <div class="info-item_col">
              <p class="info-item_set">
                <span class="search-set">允许别人搜到我</span>
                <span class="search-status">
                  {{currUser.searchflag==1?'已开启':'已关闭'}}
                </span>
              </p>
              <p class="info-item_set">
                <span class="search-set">加好友时需要验证</span>
                <span class="search-status">
                  {{currUser.fdvalidtype==1?'已开启':'已关闭'}}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div class="info-group-btn">
          <button
            class="primarybtn"
            @click="showUpdateInfo(1)"
          >修改信息</button>
          <button
            class="primarybtn default"
            @click="sendMsg"
          >发消息</button>
        </div>
      </div>
    </div>
    <!-- 路由tab -->
    <div class="nav-center">
      <div
        :class="['navbar-icon navbar-chat',currentRoute=='/home'?'active':'']"
        @click="toRoute('/home')"
      >
        <span>聊天</span>
        <span
          v-if="allNotRead!=0"
          class="notread notreadwid"
        >{{allNotRead}}</span>
      </div>
      <div
        :class="['navbar-icon navbar-friends',currentRoute=='/friend'?'active':'']"
        @click="toRoute('/friend')"
      >
        <span>好友</span>
        <span
          v-if="noReadApply!=0"
          class="notread notreadwid"
        >{{noReadApply}}</span>
      </div>
      <div
        :class="['navbar-icon navbar-groups',currentRoute=='/group'?'active':'']"
        @click="toRoute('/group')"
      >
        <span>群聊</span>
      </div>
    </div>
    <!-- 其他 -->
    <div
      class="nav-footer"
      @click.stop="stopProp"
    >
      <!-- <span class="icon_collect cursor" @click="collectShow"></span> -->
      <i
        :class="['iconfont iconIMweb_more',moreshow?'active':'']"
        @click="showMoreOper"
      ></i>
      <ul
        class="more-oper"
        v-show="moreshow"
      >
        <li
          class="more-item"
          @click.stop="updateShow(currUser.phonebindflag)"
        >
          <img
            class="jhbgvfdd"
            src="@/assets/imgs/login/mobile_icon.png"
            alt=""
            srcset=""
          >
          <span>{{currUser.phonebindflag==1?'修改手机':currUser.phonebindflag==2?'绑定手机':''}}</span>
        </li>
        <li
          class="more-item"
          @click="showUpdatePwd"
        >
          <i class="iconfont iconPassword"></i>
          <span>修改密码</span>
        </li>
        <li
          class="more-item"
          @click="showLogOut"
        >
          <i class="iconfont iconttubiao_signout"></i>
          <span>退出登录</span>
        </li>
      </ul>
    </div>
    <!-- 收藏列表 -->
    <div
      class="collect_list"
      v-show="collectShowFlag"
    >
      <div class="collect-header">
        <span>我的收藏</span>
        <i
          class="iconfont iconIMweb_cancel_cancel cancel cursor"
          @click="collectShowFlag = false"
          size="14px"
        ></i>
      </div>
      <div class="collect-content">
        <ul class="tab-list">
          <li
            :class="['tab-item cursor',tabIndex==index?'tab_select':'']"
            v-for="(item,index) in tabList"
            :key="index"
            @click="switchTab(index)"
          >
            {{item.title}}
            <p></p>
          </li>
          <li class="choessMore">多选</li>
        </ul>
      </div>
    </div>
    <!-- 修改用户信息 -->
    <CurrInfo
      :infoshow.sync="infoshow"
      :userinfo="userinfo"
      :type="infotype"
    ></CurrInfo>
    <!-- 修改密码 -->
    <UpdatePwd
      :pwdshow="pwdshow"
      @hideUpdatePwd="hideUpdatePwd"
    ></UpdatePwd>
    <!-- 退出登录 -->
    <LogOut :outshow.sync="outshow"></LogOut>
    <!-- 绑定手机号 -->
    <Dialog v-show="bindMobileShow">
      <div class="bindMobile-modelbody modelbody">
        <div class="bindMobile-header">
          <p>绑定手机号</p>
          <p>根据国家有关法律法规要求，使用互联网服务需进行账号实名，请绑定实名手机号。</p>
        </div>
        <el-form
          :model="bindMobile.form"
          class="user-form"
        >
          <el-form-item prop="loginName">
            <div class="input-row">
              <img
                class="iconfont"
                src="@/assets/imgs/login/mobile_icon.png"
                alt=""
                srcset=""
              >
              <el-input
                class="user-input"
                type="text"
                maxlength='11'
                v-model="bindMobile.form.loginName"
                placeholder="请输入您的手机号"
                @input="mobileInput"
              ></el-input>
            </div>
          </el-form-item>
          <el-form-item prop="mobileCode">
            <div class="input-row">
              <img
                class="iconfont"
                src="@/assets/imgs/login/check_icon.png"
                alt=""
                srcset=""
              >
              <el-input
                class="user-input"
                type="text"
                v-model="bindMobile.form.code"
                placeholder="请输入您的验证码"
                @input="codeInput"
              ></el-input>
              <p
                style="cursor:pointer;"
                :class="[mobileTipsFlag?'countDown':'','get-mobileCode']"
                @click.stop="mobileTipsFlag?'':getVerify(bindMobile.form.loginName)"
              >{{mobileTips}}</p>
            </div>
          </el-form-item>
          <el-form-item prop="passWord">
            <div class="input-row">
              <i class="iconfont iconttubiao_password"></i>
              <el-input
                :class="['user-input',seepwd ?'':'inputPsd']"
                v-model="bindMobile.form.passWord"
                placeholder="请输入当前账号密码"
                autoComplete="off"
              ></el-input>
              <i
                :class="[
                    'iconfont cursor icon-pwd',
                    seepwd ? 'iconttubiao_display' : 'iconttubiao_hide',
                  ]"
                @click="seepwd=!seepwd"
              ></i>
            </div>
          </el-form-item>
          <div class="bot-group">
            <span>{{errorMsg}}</span>
          </div>
          <div class="bindMobile-button-group">
            <p
              class="bindMobile-primarybtn cursor"
              @click="hideRegDialog"
            >取消</p>
            <input
              class="primarybtn bindMobile-primarybtn cursor"
              :disabled="(checkMobileFlag&&!checkSmsFlag)||(!checkMobileFlag&&checkSmsFlag)||(!checkMobileFlag&&!checkMobileFlag)"
              @click="bindMobileClik"
              readonly="readonly"
              value="确定"
            />

          </div>
        </el-form>
      </div>
    </Dialog>
    <!-- 修改手机号 -->
    <Dialog v-show="updateMobileShow">
      <div class="updateMobile-modelbody modelbody">
        <div class="updateMobile-header">
          <p>修改手机号</p>
          <div class="step-list">
            <ul class="step-ul">
              <li :style="{background:oldMobileShow?'#3596FC':'#F1F1F1'}"> </li>
              <li :style="{background:newsMobileShow&&!mobileSucShow?'#3596FC':'#F1F1F1'}"> </li>
              <li :style="{background:mobileSucShow?'#3596FC':'#F1F1F1'}"> </li>
            </ul>
          </div>
          <p
            v-show="oldMobileShow"
            class="updateMobile-Tips"
          >短信验证码将发送至当前手机号：{{mobileEncryption(currUser.phone)}}</p>
        </div>
        <i
          class="iconfont iconIMweb_cancel_cancel cursor"
          @click="updateMobileShow = !updateMobileShow"
          size="14px"
        ></i>
        <el-form
          :model="updateMobile.form"
          class="user-form"
        >
          <el-form-item
            prop="mobileCode"
            v-show="oldMobileShow"
          >
            <div class="input-row">
              <img
                class="iconfont"
                src="@/assets/imgs/login/check_icon.png"
                alt=""
                srcset=""
              >
              <el-input
                class="user-input"
                type="text"
                v-model="updateMobile.form.code"
                placeholder="请输入您的验证码"
                @input="codeInput"
              ></el-input>
              <p
                :class="[mobileTipsFlag?'countDown':'','get-mobileCode']"
                @click.stop="mobileTipsFlag?'':getVerify(currUser.phone)"
              >{{mobileTips}}</p>
            </div>
          </el-form-item>
          <div
            class="bot-group"
            v-show="oldMobileShow"
          >
            <span>{{errorMsg}}</span>
          </div>
          <div
            class="updateMobile-button-group"
            v-show="oldMobileShow"
          >
            <input
              class="primarybtn updateMobile-primarybtn cursor"
              :disabled="!checkSmsFlag"
              @click="nextStepClick"
              readonly="readonly"
              value="下一步"
            />
          </div>
          <el-form-item
            prop="loginName"
            v-show="newsMobileShow"
          >
            <div class="input-row">
              <img
                class="iconfont"
                src="@/assets/imgs/login/mobile_icon.png"
                alt=""
                srcset=""
              >
              <el-input
                class="user-input"
                type="text"
                maxlength='11'
                v-model="updateMobile.form.loginName"
                placeholder="请输入您的手机号"
                @input="mobileInput"
              ></el-input>
            </div>
          </el-form-item>
          <el-form-item
            prop="mobileCode"
            v-show="newsMobileShow"
          >
            <div class="input-row">
              <img
                class="iconfont"
                src="@/assets/imgs/login/check_icon.png"
                alt=""
                srcset=""
              >
              <el-input
                class="user-input"
                type="number"
                v-model="updateMobile.form.newCode"
                placeholder="请输入您的验证码"
                autoComplete="new-password"
                @input="codeInput"
              ></el-input>
              <p
                :class="[mobileTipsFlag?'countDown':'','get-mobileCode']"
                @click.stop="mobileTipsFlag?'':getVerify(updateMobile.form.loginName)"
              >{{mobileTips}}</p>
            </div>
          </el-form-item>
          <el-form-item
            prop="passWord"
            v-show="newsMobileShow"
          >
            <div class="input-row">
              <i class="iconfont iconttubiao_password"></i>
              <el-input
                :class="['user-input',seepwd ?'':'inputPsd']"
                v-model="updateMobile.form.passWord"
                placeholder="请输入当前账号密码"
                autoComplete="off"
              ></el-input>
              <i
                :class="['iconfont cursor icon-pwd',seepwd ? 'iconttubiao_display' : 'iconttubiao_hide',]"
                @click="seepwd = !seepwd"
              ></i>
            </div>
          </el-form-item>
          <div
            class="bot-group"
            v-show="newsMobileShow"
          >
            <span>{{errorMsg}}</span>
          </div>
          <div
            class="updateMobile-button-group"
            v-show="newsMobileShow"
          >
            <p
              class="cursor updateMobile-primarybtn"
              @click="updateMobileClik"
            >提交</p>
          </div>
        </el-form>
      </div>
    </Dialog>
    <!-- 图片验证 -->
    <Verify
      @success="verifySuccess"
      :captchaType="'blockPuzzle'"
      :imgSize="{width:'400px',height:'200px'}"
      ref="verify"
    ></Verify>
    <!-- 绑定/修改成功弹窗 -->
    <Dialog v-show="mobileSucShow">
      <div class="modelbody">
        <div class="model-success-icon">
          <img
            src="@/assets/imgs/login/success-icon.png"
            alt=""
            srcset=""
          >
        </div>
        <p class="success-password">{{ regmsg }}</p>
        <p class="success-register">{{ successMsg }}</p>
        <div class="button-group">
          <p
            class="cursor primarybtn"
            @click="hideRegDialog"
          >返回登录</p>
        </div>
      </div>
    </Dialog>
    <!-- 第三方登录绑定手机号提示弹窗 -->
    <Otherlogin
      v-show="othershow"
      :ortherLogin="ortherLogin"
    ></Otherlogin>
    <!-- 个人信息二维码 -->
    <qrCode
      :infoQrCode.sync="infoQrCode"
      :codeValue="codeValue"
      :user_avatar="user_avatar"
      :currUser="currUser"
      :qrmsg="qrmsg"
      @hideInfoQrCode="hideInfoQrCode"
    ></qrCode>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import { chatcom, msgTips, user } from '@/axios/path';
import { chatcoms } from '@/axios/paths';
import UpdatePwd from '@/components/UpdatePwd';//修改密码
import CurrInfo from '@/components/CurrInfo';//当前用户信息操作
import LogOut from '@/components/LogOut';//退出登录
import CryptoJS from 'crypto-js' //加密
import login from '@/mixins/login.js' //发送消息相关逻辑
import Verify from '@/components/verifition/Verify'
import Dialog from '@/components/Dialog.vue' //弹框
import Otherlogin from '@/components/otherLogin.vue' //弹框
import { resUrl } from '@/assets/js/common';
import qrCode from "@/components/qrCode";//二维码
export default {
  data () {
    return {
      show: false,//用户信息
      moreshow: false,//更多操作弹框
      userinfo: {},//修改用户信息
      infoshow: false,//修改个人信息-弹框显示状态
      pwdshow: false,//修改密码-弹框显示状态
      outshow: false,//退出登录-弹框显示状态
      infotype: 1,//1:修改用户信息 2:修改用户头像
      bindMobileShow: false,//绑定手机号-弹框显示状态
      updateMobileShow: false,//修改手机号
      bindMobile: {
        //绑定手机表单
        form: {
          loginName: '',
          passWord: '',
          code: '',
        }
      },
      updateMobile: {
        //修改手机表单
        form: {
          loginName: '',
          passWord: '',
          code: '',
          newCode: ''
        }
      },
      ortherLogin: {
        //验证码表单和规则
        form: {
          loginName: '',
          code: '',
        }
      },
      seepwd: false,//密码查看状态
      mobileSucShow: false,//绑定/修改手机号-弹框显示状态
      regmsg: '',//绑定/修改成功提示
      successMsg: '',//绑定/修改提示
      oldMobileShow: false,//原来手机号展示状态
      newsMobileShow: false,//新手机号展示状态
      sendSuccess: false,//发送短信是否成功状态
      infoQrCode: false,//个人信息二维码
      logo: require("@/assets/imgs/common/t-io-logo.png"),
      codeValue: '', // 二维码内容
      user_avatar: '',//二维码头像
      qrmsg: '加我为好友',
      collectShowFlag: false,//收藏-弹框显示状态
      tabList: [
        {
          title: "图片"
        },
        {
          title: "视频"
        },
      ],
      tabIndex: 0,
    }
  },
  components: {
    UpdatePwd,
    CurrInfo,
    LogOut,
    Verify,
    Dialog,
    Otherlogin,
    qrCode
  },
  computed: {
    ...mapState({
      currUser: (state) => state.User.currUser,
      allNotRead: store => store.Ws.allNotRead,//总未读条数
      noReadApply: state => state.Ws.noReadApply,//未通过申请好友数
      applyThis: state => state.Ws.applyThis//当前页面this
    }),
    currentRoute () {
      return this.$route.path
    }
  },
  mounted () {
    // 1.先判断手机是否绑定 phonebindflag：2判断已绑定第三方,thirdbindflag：1
    if (this.currUser.phonebindflag === 2) {
      // if(this.currUser.thirdbindflag===1){// 绑定第三方，但是没有绑定手机号的弹出弹窗
      //     this.othershow = true
      // }else{ // 目前只有邮箱账号，未来开放登录账号注册调整逻辑
      //     this.bindMobileShow = true
      // }
    }
    this.codeValue = `https://a.app.qq.com/o/simple.jsp?pkgname=com.tiocloud.chat&uid=${this.currUser.id}`
    this.user_avatar = resUrl(this.currUser.avatarbig)
  },
  mixins: [login],
  methods: {
    ...mapMutations(['setChatOn']),
    /* 路由跳转 */
    toRoute (path) {
      this.$router.push(path);
      if (this.currUser.thirdbindflag === 1 && this.currUser.phonebindflag === 2) {// 绑定第三方，但是没有绑定手机号的弹出弹窗
        this.othershow = true
      }

    },
    /* 显示|隐藏 -用户信息弹框 */
    showUserCard () {
      document.documentElement.click();
      this.show = !this.show;
      if (this.show) {
        this.$setAddEventListener('show');
      }
    },
    /* 组织冒泡 */
    stopProp () {

    },
    /* 显示-修改信息弹框 */
    showUpdateInfo (type) {
      this.show = false;
      this.userinfo = { ...this.currUser };
      this.infotype = type;
      this.infoshow = true;

    },
    /* 显示|隐藏-更多操作框 */
    showMoreOper () {
      document.documentElement.click();
      this.moreshow = !this.moreshow;
      if (this.moreshow) {
        this.$setAddEventListener('moreshow');
      }
    },
    /* 显示-修改密码弹框 */
    showUpdatePwd () {
      this.moreshow = false;
      this.pwdshow = true;
    },
    /* 隐藏-修改密码弹框 */
    hideUpdatePwd () {
      this.pwdshow = false;
    },
    /* 显示-退出登录弹框 */
    showLogOut () {
      this.moreshow = false;
      this.outshow = true;
    },
    /* 发消息 */
    async sendMsg () {
      let postdata = {
        touid: this.currUser.id,
      };
      let currpath = this.$route.path;
      let res = await chatcoms.chatActChat(postdata);
      document.documentElement.click();
      if (res.ok) {
        let data = res.data.chat;
        if (currpath == '/home') {
          this.applyThis.$refs.chatlist.chatColClick(data);
        } else {
          this.setChatOn({ chatOn: data.id, bizid: data.bizid, isGroup: false });
          this.$router.push({ path: '/home' });
        }
      } else {
        msgTips(res.msg);
      }
    },
    /**修改手机号弹窗 */
    updateShow (type) {
      this.errorMsg = ''
      this.seepwd = false
      this.checkSmsFlag = false
      this.currentIndex = -1
      this.moreshow = false
      if (type === 1) { // 修改手机号
        this.updateMobileShow = true
        this.oldMobileShow = true
        this.newsMobileShow = false
        this.checkMobileFlag = true
        this.mobileTipsFlag = false
        this.mobileTips = '获取验证码'
        clearInterval(this.deltimer)
        this.updateMobile = this.$options.data().updateMobile
      } else if (type === 2) { // 绑定手机号
        this.bindMobileShow = true
        this.bindMobile = this.$options.data().bindMobile
      }
    },
    /* 图形验证成功之后 */
    verifySuccess (e) {
      let currentIndex = this.currentIndex, captchaVerification = e.captchaVerification
      if (this.bindMobileShow) {
        this.getMobileCode(1, this.bindMobile.form.loginName, captchaVerification)//获取绑定手机号验证码
      } else if (this.updateMobileShow && this.oldMobileShow) {//输入原来手机号
        this.getMobileCode(5, this.currUser.phone, captchaVerification)//获取老手机验证码
      } else if (this.updateMobileShow && this.newsMobileShow) {//输入新手机号
        this.getMobileCode(7, this.updateMobile.form.loginName, captchaVerification)//获取新手机验证码
      }
    },
    /**修改手机号 - 下一步 */
    nextStepClick () {
      log('下一步')
      if (this.updateMobile.form.code == '' || this.updateMobile.form.code == undefined) {
        this.errorMsg = '请输入您的验证码'
        return
      }
      if (!this.checkSmsFlag) {
        return
      }
      this.mobileTipsFlag = false
      this.mobileTips = '获取验证码'
      clearInterval(this.deltimer)
      this.oldMobileShow = false
      this.newsMobileShow = true
      this.mobileSendTips = ''
    },
    /**修改手机号 */
    updateMobileClik () {
      let { loginName, passWord, newCode } = this.updateMobile.form
      if (loginName == '') {
        this.errorMsg = '请输入您的手机号'
        return
      } else if (newCode == '') {
        this.errorMsg = '请输入您的验证码'
        return
      } else if (passWord == '') {
        this.errorMsg = '请输入您的验证码'
        return
      }
      let email = this.currUser.email
      let key1 = "$", key2 = "{", key3 = "}"
      let palinstr = `${key1}${key2}${loginName}${key3}${passWord}`
      let phonepwd = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(palinstr)).toString()
      let palinstr_1 = `${key1}${key2}${email}${key3}${passWord}`
      let emailpwd = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(palinstr_1)).toString()
      let data = { code: newCode, phone: loginName, phonepwd, emailpwd }
      chatcom.bindnewphone(data).then(res => {
        if (res.ok) {
          this.mobileSucShow = true
          this.regmsg = res.msg || '手机号修改成功'
          this.successMsg = '请重新登录'
          this.errorMsg = ''
        } else {
          msgTips(res.msg)
        }
      })
    },
    /**绑定手机号 */
    bindMobileClik () {
      let { loginName, passWord, code } = this.bindMobile.form
      if (loginName == '' || loginName == 'undefined') {
        this.errorMsg = '请输入您的手机号'
        return false
      } else if (!/^1[3456789]\d{9}$/.test(loginName)) {
        this.errorMsg = '请输入正确的手机号'
        return false
      } else if (code == '' || code == 'undefined') {
        this.errorMsg = '请输入您的验证码'
        return false
      } else if (passWord == '' || passWord == 'undefined') {
        this.errorMsg = '请输入您当前的账号密码'
        return false
      }
      let email = this.currUser.email
      let key1 = "$", key2 = "{", key3 = "}"
      let palinstr = `${key1}${key2}${loginName}${key3}${passWord}`
      let phonepwd = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(palinstr)).toString()
      let palinstr_1 = `${key1}${key2}${email}${key3}${passWord}`
      let emailpwd = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(palinstr_1)).toString()
      let resetPwd = { code: code, phone: loginName, phonepwd, emailpwd }
      chatcom.bindphone(resetPwd).then(res => {
        if (res.ok) {
          this.mobileSucShow = true
          this.regmsg = res.msg || '手机号绑定成功'
          this.successMsg = '您可以使用手机或邮箱进行登录了'
          this.errorMsg = ''
        } else {
          msgTips(res.msg)
        }
      })
    },
    /** 关闭绑定/修改成功提示弹窗 */
    hideRegDialog () {
      this.mobileSucShow = false
      user.logout().then(res => {
        if (res.ok) {
          location.reload();
        } else {
          msgTips(res.msg);
        }
      })
    },
    hideInfoQrCode () {
      this.infoQrCode = false
    },
    collectShow () {
      this.collectShowFlag = !this.collectShowFlag
    },
    /* 切换tab栏 */
    switchTab (e) {
      this.tabIndex = e
    }
  }
}
</script>
<style lang='less' scoped>
@import "~@/assets/style/less/components/navbar.less";
</style>