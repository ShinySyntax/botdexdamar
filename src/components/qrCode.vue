<template>
 <div>
    <!-- 个人信息二维码 -->
    <Dialog v-show="infoQrCode">
      <div class="info-modelbody modelbody">
        <i class="iconfont iconIMweb_cancel_cancel cancel cursor" @click="hideInfoQrCode" size="14px"></i>
          <div class="user-info">
            <el-image class="user-avatar" :src="user_avatar"  crossorigin="anonymous">
              <div slot="error" class="image-slot">
                  <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
              </div>
            </el-image>
            <span class="user-nick">{{qrNick}}</span>
          </div>
          <div class="qrCode-img">
              <vue-qr :logoSrc="logo" :margin="5" ref="Qrcode"  :text="codeValue" :size="198"></vue-qr>
              <span style="letter-spacing:5px">使用APP扫一扫</span>
              <span style="letter-spacing:5px">{{qrmsg}}</span>
          </div>
 
        <div class="user-dowm cursor">
          <div @click="saveImage('capture', 'tio-user')">
            <img src="~@/assets/imgs/home/down.png" alt="" srcset="">
            <span>保存到电脑</span>
          </div>
        </div>
        <div class="qrCode-mask"></div>
       <div class="save_qrCode" id="save_qrCode_box" ref="capture" >
        <div class="">
          <div class="user-info">
            <el-image class="user-avatar" :src="user_avatar"  crossorigin="anonymous">
              <div slot="error" class="image-slot">
                  <img src="~@/assets/imgs/common/avatar.jpg" class="error-img" />
              </div>
            </el-image>
             <span class="user-nick">{{qrNick}}</span>
          </div>
          <div class="qrCode-img">
              <vue-qr :logoSrc="logo" :margin="5" ref="Qrcode"  :text="codeValue" :size="198"></vue-qr>
              <span style="letter-spacing:5px">使用APP扫一扫</span>
              <span style="letter-spacing:5px">{{qrmsg}}</span>
          </div>
        </div>
      </div>
      </div>
    </Dialog>
 </div>
</template>
<script>
import Dialog from '@/components/Dialog.vue' //弹框
import vueQr from 'vue-qr'
import html2canvas from 'html2canvas';
import {resUrl} from '@/assets/js/common';
export default {
    props:['infoQrCode','codeValue','user_avatar','currUser','qrmsg'],
    data(){
        return{
            logo:require("@/assets/imgs/common/t-io-logo.png"),
            qrNick:"",
            user_avatar_1:""
        }
    },
    components:{
      Dialog,
      vueQr
    },
    watch:{
      infoQrCode(nv){
        if(this.currUser.name){
          this.qrNick = this.currUser.name.length>18?this.currUser.name.substring(0,18)+'...':this.currUser.name
          this.user_avatar_1 = resUrl(this.currUser.avatar)
        }else{
          this.qrNick = this.currUser.nick.length>18?this.currUser.nick.substring(0,18)+'...':this.currUser.nick
          this.user_avatar_1 = resUrl(this.currUser.avatarbig)
        }
      }
      
    },
    methods:{
        //图片转换格式的方法
        dataURLToBlob(dataurl) {
            let arr = dataurl.split(',');
            let mime = arr[0].match(/:(.*?);/)[1];
            let bstr = atob(arr[1]);
            let n = bstr.length;
            let u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        },
        /*保存图片的方法（即按钮点击触发的方法）   
          第一个参数为需要保存的div的id名  
          第二个参数为保存图片的名称 */
        saveImage(divText, imgText) {
            let canvasID = this.$refs[divText];
            let that = this;
            let a = document.createElement('a');
            var opts = {
              useCORS: true, // 【重要】开启跨域配置
              scale:2,
              height: 459,
              width:366,
              // scrollY: 0, 
              // scrollX: 0,
              // width:window.screen.availWidth,  //canvas宽度
              //  height:window.screen.availHeight, //canvas高度
              windowWidth:0, //获取X轴方向滚动条内容
              windowHeight:0,//获取Y轴方向滚动条内容
              x:-180,//页面在水平方向滚动的距离
              y:-280,//页面在垂直方向滚动的距离
            };
            window.pageYOffset = 0;
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            // 获取页面滚动高度
           setTimeout(function() {
                html2canvas(canvasID,opts).then(canvas => {
                    let dom = document.body.appendChild(canvas);
                    dom.style.display = 'none';
                    a.style.display = 'none';
                    // dom.style.height = "459"; //注意 下面解决当页面滚动之后生成图片出现白边问题
                    // dom.style.width = "366";  //注意 下面解决当页面滚动之后生成图片出现白边问题
                    log(canvas)
                    let blob = that.dataURLToBlob(dom.toDataURL('image/png'));
                    a.setAttribute('href', URL.createObjectURL(blob));
                    //这块是保存图片操作  可以设置保存的图片的信息
                    a.setAttribute('download', imgText + '.png');
                    document.body.appendChild(a);
                    a.click();
                    URL.revokeObjectURL(blob);
                    document.body.removeChild(a);
                });
            },500);
        },
        /**防抖 */
        debounce(fn, delay) {
          if (this.timer != null) {
            clearTimeout(this.timer)
          }
          this.timer = setTimeout(fn, delay)
        },
        hideInfoQrCode(){
          this.$emit('hideInfoQrCode')
        }
    }
}
</script>
<style lang="less" scoped>
.info-modelbody{
  width: 366px;
  height: 557px;
  display: flex;
  align-items: center;
  flex-direction: column;
  
  .cancel{
    position: absolute;
    right: 20px;
    top: 23px;
    font-size: 30px;
    color: #fff;
  }
  .user-info{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 52px;
    .user-avatar{
      width: 50px;
      height: 50px;
      border-radius: 4px;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    .user-nick{
      margin-left: 10px;
      font-size: 16px;
      color: #fff;
      max-width: 176px;
      text-align: left;
      letter-spacing:1.5px
    }
  }
  .user-dowm{
    position: absolute;
    bottom: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 80px;
    & div{
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    img{
      width: 48px;
      height: 48px;
    }
    span{
      font-size: 14px;
      color: #fff;
      margin-top: 18px;
    }
  }
  .qrCode-mask{
    position: absolute;
    background-image: url('~@/assets/imgs/home/bg_qr.png');
    background-size: 100% 100%;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: -50;
  }
}
.save_qrCode{
    width: 366px;
    height: 459px;
    background-image: url('~@/assets/imgs/home/bg_qr.png');
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    color: #fff;
    font-size: 16px;
    position: absolute;
    z-index: -100;
  .user-info{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    .user-avatar{
      width: 50px;
      height: 50px;
      margin-right: 11px;
    }
  }
}
.qrCode-img{
  width: 240px;
  height: 290px;
  border-radius: 12px;
  background: #fff;
  color: #999;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  span{
    margin-top: 13px;
    letter-spacing: 3px;
    text-align:justify
  }
  :last-child {
    margin-top: 5px;
  }
}
</style>