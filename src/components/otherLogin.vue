<template>
  <div>

    <!-- 第三方登录绑定手机号提示弹窗 -->
    <Dialog>
      <div class="other-modelbody modelbody">
        <div class="other-header">
          <p>绑定手机号</p>
          <p>根据国家有关法律法规要求，使用互联网服务需进行账号实名，请绑定实名手机号。</p>
        </div>
        <el-form :model="ortherLogin.form" class="user-form" ref="ortherLoginform">
          <el-form-item prop="loginName">
            <div class="input-row">
              <img class="iconfont" src="@/assets/imgs/login/mobile_icon.png" alt="" srcset="">
              <el-input class="user-input" maxlength='11' v-model="ortherLogin.form.loginName" placeholder="请输入您的手机号" @input="OthMobileInput"></el-input>
            </div>
          </el-form-item>
          <el-form-item prop="mobileCode">
            <div class="input-row">
              <img class="iconfont" src="@/assets/imgs/login/check_icon.png" alt="" srcset="">
              <el-input class="user-input" type="text" v-model="ortherLogin.form.code" placeholder="请输入您的验证码" @input="otherCodeInput"></el-input>
              <p style="cursor:pointer;" :class="[mobileTipsFlag?'countDown':'','get-mobileCode']" @click.stop="mobileTipsFlag?'':getVerify(ortherLogin.form.loginName)">{{mobileTips}}</p>
            </div>
          </el-form-item>
          <div class="bot-group">
            <span>{{errorMsg}}</span>
          </div>
          <div class="other-button-group">
            <p class="other-primarybtn cursor" @click="cancel">取消</p>
            <input class="primarybtn other-primarybtn cursor" :disabled="(checkMobileFlag&&!checkSmsFlag)||(!checkMobileFlag&&checkSmsFlag)||(!checkMobileFlag&&!checkMobileFlag)" @click="bindMobile" readonly="readonly" value="提交"
          />
          </div>
        </el-form>
      </div>
    </Dialog>

    <Dialog v-show="tipsShow">
      <div class="tipsShow-modelbody modelbody">
        <div class="other-header">
          <p style="line-height:34px">
            该手机号已注册，如绑定至该手机，<br>
            则当前三方账号将清空，是否绑定该手机？
          </p>
        </div>
        <div class="tipsShow-button-group">
          <p class="tipsShow-primarybtn cancelBtn cursor" @click="tipsShow = false,ortherLogin.form.loginName = ''">换其他手机</p>
          <p class="tipsShow-primarybtn cursor" @click="getVerify(ortherLogin.form.loginName)">绑定该手机</p>
        </div>
      </div>
    </Dialog>
    <!-- 手机号已被其他账号绑定 -->
    <Dialog v-show="errorTipsShow">
      <div class="tipsShow-modelbody modelbody">
        <div class="other-header">
          <p>{{regmsg}}</p>
        </div>
        <div class="tipsShow-button-group">
          <p class="tipsShow-primarybtn cursor" @click="errorTipsShow=false">确定</p>
        </div>
      </div>
    </Dialog>
    <!-- 手机号绑定成功提示弹框 -->
    <Dialog v-show="successShow">
      <div class="modelbody">
        <div class="model-success-icon">
          <img src="@/assets/imgs/login/success-icon.png" alt="" srcset="">
        </div>
        <p class="success-register">{{ regmsg }}</p>
        <div class="button-group">
          <button class="primarybtn cursor" @click="successify">确定</button>
        </div>
      </div>
    </Dialog>
    <!-- 图片验证 -->
    <Verify @success="verifySuccess" :captchaType="'blockPuzzle'" :imgSize="{width:'400px',height:'200px'}" ref="verify"></Verify>
  </div>
</template>
<script>
import login from "@/mixins/login.js" //发送消息相关逻辑
import Verify from '@/components/verifition/Verify'
import Dialog from "@/components/Dialog.vue" //弹框
import { user, msgTips } from "@/axios/path"
export default {
    data(){
        return {
            tipsShow:false,// 已注册信息提示弹窗
            errorTipsShow:false,// 手机号已绑定信息提示弹窗
            successShow:false,// 绑定成功弹窗
            regmsg:""
        }
    },
    props:['ortherLogin'],
    components:{
        Verify,
        Dialog
    },
    mixins: [login],
    mounted(){
    },
    methods:{
      verifySuccess(e){
          let captchaVerification = e.captchaVerification
          this.getMobileCode(8,this.ortherLogin.form.loginName,captchaVerification)//第三方绑定手机号
          this.tipsShow = false
      },
      OthMobileInput(e){
        this.errorMsg = ""
        if(e.length===11){
          this.currentIndex = -1
          this.checkOtherMobile(8,this.ortherLogin.form.loginName)
        }
      },
      /**验证码input */
      otherCodeInput(e){
        this.errorMsg = ""
        this.checkSmsFlag = false
          if(e.length==6){
            this.currentIndex = -1
            this.smsCheck(8,this.ortherLogin.form.loginName,this.ortherLogin.form.code)
          }
      },
      /**校验手机号 */
      checkOtherMobile(biztype,mobile){
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
                if(res.data == 1){//该手机号已注册
                  this.tipsShow = true
                }
              }else{
                this.checkMobileFlag = false
                this.errorTipsShow = true
                this.regmsg = res.msg
                this.ortherLogin.form.loginName = ''
              }
          })
      },
      bindMobile(){
          let { loginName, code } = this.ortherLogin.form
          if(loginName===''){
            this.errorMsg = '请输入您的手机号'
            return
          }else if(code===''){
            this.errorMsg = '请输入您的验证码'
          }
          let data = {
            phone:loginName,
            code
          }
          user.userThirdbindphone(data).then(res=>{
              if (res.ok) {
                  this.successShow = true
                  this.regmsg = res.msg || '手机号绑定成功'
              } else {
                  msgTips(res.msg)
              }
          })
      },
      /**
       * 取消
       */
      cancel(){
          this.successShow = false
          user.logout().then(res=>{
              if(res.ok){
                  location.reload();
              }else{
                  msgTips(res.msg);
              }
          })
      },
      successify(){
          this.successShow = false
          location.reload();
      }
    }
}
</script>
<style lang="less" scoped>
.modelbody {
  color: #333;
  min-width: 300px;
  p {
    line-height: 20px;
    text-align: center;
    margin: 2px 0;
  }

  .success-icon {
    font-size: 26px;
    display: block;
    margin: 20px 0 22px;
    text-align: center;
    color: #8cc3fc;
  }
  .button-group {
    padding-top: 28px;
  }
  .success-register {
    font-size: 18px;
    padding: 0 30px;
    max-width: 300px;
  }
  .model-success-icon {
    text-align: center;
    margin-top: 20px;
    img {
      width: 68px;
      height: 68px;
    }
  }
  .primarybtn {
    width: 180px;
    height: 40px;
    border-radius: 50px;
    line-height: 40px;
    text-align: center;
  }
  .other-primarybtn{
    width: 110px;
    height: 42px;
    border-radius: 50px;
    line-height: 42px;
  }
  .tipsShow-primarybtn{
    width: 146px;
    height: 40px;
    line-height: 40px;
    background: linear-gradient(to right, #44baf8, #3596fc);
    color: #fff;
    border-radius: 5px;
    
  }
  .other-primarybtn {
    background: linear-gradient(to right, #44baf8, #3596fc);
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
  }
  .other-button-group {
    display: flex;
    width: 250px;
    justify-content: space-between;
    margin-top: 10px;
    &:last-child p {
      background:linear-gradient(to right,#F5F5F5,#EDEFF3);
      color: #666;
    }
  }
  .user-form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  /deep/.el-form-item {
    margin-bottom: 10px;
  }
}
.tipsShow-modelbody{
  min-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
    .other-header {
      margin: 60px 0 46px;
      p{
        color: #333;
        font-size: 16px;
      }
    }
}
.other-modelbody {
  min-height: 350px;
  min-width: 428px;
  padding: 24px;
  .other-header {
    p {
      text-align: left;
    }
    p:first-child {
      font-size: 16px;
      color: #333;
      margin-bottom: 20px;
    }
    p:last-child {
      font-size: 14px;
      color: #666;
      margin-bottom: 36px;
    }
  }
  .bot-group {
    height: 18px;
    width: 250px;
    display: flex;
    justify-content: space-between;
    span {
      font-size: 12px;
      line-height: 17px;
      color: #fb7b7a;
    }
  }
  /deep/.iconIMweb_cancel_cancel {
    font-size: 24px;
    position: absolute;
    top: 20px;
    right: 22px;
  }
  .input-row{
    justify-content: center;
  }

}
.tipsShow-button-group{
  display: flex;
  width: 100%;
  justify-content: space-around;
  .cancelBtn{
    background: linear-gradient(to right,#F5F5F5,#EDEFF3);
    color: #333333;
    font-size: 14px;
  }
}
.input-row {
  height: 42px;
  border-radius: 50px;
  background: #e1efff;
  padding: 0 17px;
  position: relative;
  .flexbox;
  width: 250px;
  .iconfont {
    font-size: 24px;
    height: 24px;
    line-height: 24px;
    color: #999;
  }
  .icon-pwd {
    font-size: 24px;
    height: 24px;
    line-height: 24px;
    color: @fontblue;
  }
  .user-input {
    display: flex;
    flex: 1;
    margin: 0 2px;
    /deep/.el-input__inner {
      line-height: 20px;
      padding: 0 2px;
      border: none;
      height: 20px;
      color: #333;
      background: none;
    }
  }
  .get-mobileCode {
    height: 100%;
    width: 86px;
    background: linear-gradient(to right, #44baf8, #3596fc);
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    color: #fff;
    font-size: 12px;
    border-radius: 50px;
    position: absolute;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .countDown {
    width: 53px;
    background: linear-gradient(to right, #97dbff, #7bbbff);
  }
}
.span-after {
  color: #3b8aff;
}
.span-after:visited,
.span-after:hover {
  text-decoration: underline;
}
.otherLogin_icon:hover {
  background: rgba(68, 186, 248, 0.2);
  display: inline-block;
  box-shadow: 0 0 0 5px rgba(68, 186, 248, 0.2);
  border-radius: 50px;
}

</style>