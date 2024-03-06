import { user } from "@/axios/path"
const login = {
  data() {
    return {
      list: [
        {
          title: "密码登录",
          index: 0,
        },
        {
          title: "账号注册",
          index: 1,
        }
      ],
      mobileTips: "获取验证码",
      mobileTipsFlag: false, //展示验证码提示/倒计时秒数
      deltimer: "", //计时器
      isChecked: false, //是否同意协议
      forgetFlag: true, //忘记密码/设置新密码
      othershow: false, //第三方注册手机号绑定提示弹窗
      errorMsg: "", //input校验错误提示
      currentIndex: 0,//当前为什么状态：0-密码登录、1-账号注册、2-返回登录、3-找回密码、4-验证码登录
      checkSmsFlag:false,//校验短信code是否正确
      checkMobileFlag:false,//校验手机号是否和该类型是否正确
    }
  },
  methods: {
    /**校验手机号 */
    checkMobile(biztype,mobile){
      if (mobile == "" || mobile == 'undefined') {
        this.errorMsg = "请输入您的手机号"
        return false
      } else if (!/^1[3456789]\d{9}$/.test(mobile)) {
        this.errorMsg = "请输入正确的手机号"
        return false
      }
      let data = {
        biztype,
        mobile
      }
      user.smsBeforeCheck(data).then(res=>{
          if(res.ok){
            this.checkMobileFlag = true
            this.errorMsg = ""
          }else{
            this.checkMobileFlag = false
            this.errorMsg = res.msg
          }
      })
    },
    /**图形验证 */
    getVerify(mobile) {
      log('图形验证')
      log(mobile)
      if (mobile == "" || mobile == 'undefined') {
        this.errorMsg = "请输入您的手机号"
        return false
      } else if (!/^1[3456789]\d{9}$/.test(mobile)) {
        this.errorMsg = "请输入正确的手机号"
        return false
      }
      this.$refs.verify.instance.refresh()//获取滑动验证图片
      if (this.checkMobileFlag) {
        this.errorMsg = ""
        this.$refs.verify.show()
      }
    },
    /**获取验证码 */
    getMobileCode(biztype,mobile,captchaVerification){

      this.mobileTips = 60
      this.mobileTipsFlag = true
      clearInterval(this.deltimer)
      this.deltimer = setInterval(() => {
        --this.mobileTips
        if (this.mobileTips == 0) {
          this.mobileTips = '获取验证码'
          this.mobileTipsFlag = false
          clearInterval(this.deltimer)
        }
      }, 1000)
      user.smsSend({
          biztype,
          mobile,
          captchaVerification
        }).then(res=>{
          if (res.ok) {
            this.sendSuccess = true
            if(this.currentIndex===3){//发送验证码成功之后展示下一步
              this.forgetFlag = false
            }
          } else {
            this.sendSuccess = false
            this.errorMsg = res.msg || '今日验证码获取次数已达到上限，请明日再试'
          }
      })
    },
    /**短信校验 */
    smsCheck(biztype, mobile, code) {
      log('我是短信校验')
      log(this.currentIndex)
      if(this.currentIndex!==0){
        if (mobile != "" && code != "") {
          this.errorMsg = ""
          user.smsCheck({ biztype, mobile, code }).then((res) => {
            log(res)
            if (res.ok) {
              this.checkSmsFlag = true
              this.errorMsg = ""
            } else {
              this.errorMsg = res.msg
              this.checkSmsFlag = false
              // 可以调用登录注册等方法
            }
          })
        } else if(mobile == ''){
          this.errorMsg = "请输入您的手机号"
        } else if(code == ''){
          this.errorMsg = "请输入您的验证码"
        }
      }
    },
    /**input校验 */
    rules() {
      if (!this.othershow) {
        if (this.currentIndex == 0) {
          // 登录
          if (this.login.form.loginName == "" || this.login.form.loginName == 'undefined') {
            this.errorMsg = "请输入您的手机号或邮箱"
            return false
          } else if (this.login.form.passWord == "" || this.login.form.passWord == 'undefined') {
            this.errorMsg = "请输入您的密码"
            return false
          }
        } else if (this.currentIndex == 1) {
          // 账号注册
          if (this.register.form.loginName == "" || this.register.form.loginName == 'undefined') {
            this.errorMsg = "请输入您的手机号"
            return false
          } else if (!/^1[3456789]\d{9}$/.test(this.register.form.loginName)) {
            this.errorMsg = "请输入正确的手机号"
            return false
          } else if (this.register.form.mobileCode == "" || this.register.form.mobileCode == 'undefined') {
            this.errorMsg = "请输入您的验证码"
            return false
          }
          if(this.emailCheck){
            if (this.register.form.email == "" || this.register.form.email == 'undefined') {
              this.errorMsg = "请输入已有邮箱账号"
              return false
            } else if (this.register.form.emailPassword == "" || this.register.form.passWord == 'undefined') {
              this.errorMsg = "请输入邮箱账号密码"
              return false
            }
          }else{
            // if (this.register.form.nick == "" || this.register.form.nick == 'undefined') {
            //   this.errorMsg = "请设置您的昵称"
            //   return false
            // } else 
            if (this.register.form.passWord == "" || this.register.form.passWord == 'undefined') {
              this.errorMsg = "请设置您的密码"
              return false
            }
          }
        } else if (this.currentIndex == 3) {
          let { passWord, newspassWord } = this.forget.form
          // 忘记密码
          if (this.forgetFlag) {
            if (this.forget.form.loginName == "" || this.forget.form.loginName == 'undefined') {
              this.errorMsg = "请输入您的手机号"
              return false
            } else if (!/^1[3456789]\d{9}$/.test(this.forget.form.loginName)) {
              this.errorMsg = "请输入正确的手机号"
              return false
            }
          } else {
            if (this.forget.form.mobileCode == "" || this.forget.form.mobileCode == 'undefined') {
              this.errorMsg = "请输入您的验证码"
              return false
            } else if (this.forget.form.passWord == "" || this.forget.form.passWord == 'undefined') {
              this.errorMsg = "请输入至少6位新密码"
              return false
            } else if (this.forget.form.newspassWord == "" || this.forget.form.newspassWord == 'undefined') {
              this.errorMsg = "再次确认新密码"
              return false
            } else if ( passWord!==newspassWord ) {
              this.errorMsg = "密码不一致，请重新输入"
              return false
            }
          }
        } else if (this.currentIndex == 4) {
          // 验证码登录
          if (this.login.form.loginName == "" || this.login.form.loginName == 'undefined') {
            this.errorMsg = "请输入您的手机号"
            return false
          } else if (!/^1[3456789]\d{9}$/.test(this.login.form.loginName)) {
            this.errorMsg = "请输入正确的手机号"
            return false
          } else if (this.login.form.authcode == "" || this.login.form.authcode == 'undefined') {
            this.errorMsg = "请输入您的验证码"
            return false
          }
        }
      } else {
        if (this.ortherLogin.form.loginName == "" || this.ortherLogin.form.loginName == 'undefined') {
          this.errorMsg = "请输入手机号"
          return false
        } else if (!/^1[3456789]\d{9}$/.test(this.forget.form.loginName)) {
          this.errorMsg = "请输入正确的手机号"
          return false
        } else if (this.ortherLogin.form.nick == "" || this.ortherLogin.form.nick == 'undefined') {
          this.errorMsg = "请输入您的验证码"
          return false
        }
      }
      this.errorMsg = ""
      return true
    },
    /**防抖 */
    debounce(fn, delay) {
      if (this.timer != null) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(fn, delay)
    },
    /**手机号加密 */
    mobileEncryption(phone){
      if(phone == ''|| phone == undefined)return
      var showPhone =  phone.replace(/^(\d{3})\d{4}(\d+)/,"$1****$2")
      return showPhone
    },
    /**手机号input */
    mobileInput(e){
      this.checkMobileFlag = false
      if(e.length===11){
          if(this.bindMobileShow){//绑定手机号
              this.currentIndex = -1
              this.checkMobile(1,this.bindMobile.form.loginName)
          } else if (this.updateMobileShow){//修改手机号
              this.currentIndex = -1
              this.checkMobile(7,this.updateMobile.form.loginName)
          } else if (this.currentIndex==1){//注册
              this.checkMobile(2,this.register.form.loginName)
          } else if (this.currentIndex==3){//忘记密码
              this.checkMobile(6,this.forget.form.loginName)
          } else if (this.currentIndex==4){// 验证码登录
              this.checkMobile(3,this.login.form.loginName)
          }  
      }
    },
    /**验证码input */
    codeInput(e){
      this.checkSmsFlag = false
        if(e.length==6){
            if(this.updateMobileShow){
                this.currentIndex = -1
                if(this.oldMobileShow){//校验老手机验证码
                    this.smsCheck(5,this.currUser.phone,this.updateMobile.form.code)
                }else if (this.newsMobileShow){//校验新手机验证码
                    this.smsCheck(7,this.updateMobile.form.loginName,this.updateMobile.form.newCode)
                }
            }else if (this.bindMobileShow){
                this.currentIndex = -1
                this.smsCheck(1,this.bindMobile.form.loginName,this.bindMobile.form.code)
            }else if (this.currentIndex==1){
              this.smsCheck(2,this.register.form.loginName,this.register.form.mobileCode)
            } else if (this.currentIndex==3){//忘记密码
              this.smsCheck(6,this.forget.form.loginName,this.forget.form.mobileCode)
            } else if (this.currentIndex==4){// 验证码登录
              this.smsCheck(3,this.login.form.loginName,this.login.form.authcode)
            }
        }
    },
  },
}
export default login
