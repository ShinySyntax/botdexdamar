<template>
    <div>
        <!-- 个人信息-修改信息 -->
        <Dialog v-show="infoshow&&type==2">
            <div class="modelbody tailoring-container">
                <div class="ff44 tailoring-content-two">
                    <div class="tailoring-box-parcel">
                        <img id="toDataURL_group" />
                    </div>
                    <!--预览区-->
                    <div class="preview-box-parcel">
                        <div class="square previewImg"></div>
                    
                        <div class="middle_square previewImg"></div>
                        <div class="middle_circular previewImg"></div>
                    
                        <div class="small_square previewImg"></div>
                        <div class="small_circular previewImg"></div>

                        <div id="cropper_data">
                            宽：<span id="dataWidth">{{txcropper.width}}</span>
                            高：<span id="dataHeight">{{txcropper.height}}</span>
                        </div>
                    </div>
                    
                </div>
                <div class="tailoring-content-three">
                    <div class="btn-group-left">
                        <button class="commonbtn cropper-reset-btn" @click="cropperReset">复位</button>
                        <button class="commonbtn cropper-rotate-btn" @click="cropperRotate">旋转</button>
                        <button class="commonbtn cropper-scaleX-btn" @click="cropperflagX">换向</button>
                    </div>
                    <div class="btn-group-right">
                        <button title="选择图片" class="primarybtn">
                            <input type="file" accept="image/jpg, image/jpeg, image/png, image/gif" name="file" id="chooseImg" class="hidefile" @change="changeAvatar">
                            选择图片
                        </button>
                        <button class="primarybtn" @click="sureCut">提 交</button>
                        <button class="primarybtn" @click="closeCropper"> 关 闭</button>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>
<script>
import { mapState,mapMutations,mapActions } from 'vuex';
import {group,msgTips} from '@/axios/path';
import Cropper from 'cropperjs';//裁剪
import 'cropperjs/dist/cropper.css';
import {resUrl} from '@/assets/js/common';
import store from '@/store/index.js';
export default {
    props:['infoshow','userinfo','type'],
    data(){
        return {
            sexList:[{"label":"男","value":1},{"label":"女","value":2},{"label":"保密","value":3}],//性别select
            searchflag:1,//是否允许别人搜到我
            fdvalidtype:1,//是否加好友时需要验证
            loading:false,
            txcropper:{
                show:false,//头像裁剪框
                cropper:null,//裁剪
                flagX:true,//反向
                height:0,//裁剪图片高
                width:0,//裁剪图片宽
            },
        }
    },
    watch:{
        infoshow(nv,ol){
            if(nv){
                if(this.type==1){
                    this.searchflag=this.userinfo.searchflag==1?true:false;
                    this.fdvalidtype=this.userinfo.fdvalidtype==1?true:false;
                }
                if(this.type==2){
                    this.initCropper();
                }
            }
        },
    },
    computed:{
        ...mapState({
            curruser:(state)=>state.User.currUser,//当前用户uid
            commGroupInfo:(state)=>state.CommonInfo.groupUserInfo, //群消息
        }),
    },
    methods:{
        ...mapMutations(['setCurrUser']),
        ...mapActions(['getChatGroupInfo']),
        /* 隐藏-修改信息弹框*/
        hideUpdateInfo(){
            // this.infoshow=false;
            this.$emit("update:infoshow",false);
        },
        /* 保存-修改用户信息 */
        saveUpdateUser(){
            this.loading=true;
            let {nick,sign,sex}=this.userinfo;
            this.userinfo.fdvalidtype=this.fdvalidtype;
            this.userinfo.searchflag=this.searchflag;
            if(nick==""){
				msgTips('昵称不能为空');
				return;
			}
            let postdata={
                nick,
                sign,
                sex,
                fdvalidtype:this.fdvalidtype?1:2,
                searchflag:this.searchflag?1:2
            };
            user.updatUser(postdata).then(res=>{
                if(res.ok){
                    this.hideUpdateInfo();
                    this.setCurrUser({...this.userinfo});
                    msgTips("保存成功");
                }else{
                    msgTips(res.msg);
                }
                this.loading=false;
            })
        },
        /* 初始化裁剪框 */
        initCropper(){
            let _this=this;
            var cropperOptions = {
                aspectRatio: 1 / 1, //默认比例
                preview: '.previewImg', //预览视图
                aspectRatio: 1,
                viewMode: 1,
                crop: function (e) {
                    // 输出结果数据裁剪图像。
                    var data = e.detail;
                    _this.txcropper.width=Math.round(data.width)+'px';
                    _this.txcropper.height=Math.round(data.height)+'px';
                }
            };
            this.txcropper.width=0;
            this.txcropper.height=0;
            if(this.txcropper.cropper){
                this.txcropper.cropper.destroy();
            }
            this.txcropper.cropper = new Cropper(document.getElementById("toDataURL_group"), cropperOptions);
        },
        /* 旋转 */
        cropperRotate(){
            this.txcropper.cropper.rotate(45);
        },
        /* 复位 */
        cropperReset(){
            this.txcropper.cropper.reset();
        },
        /* 换向 */
        cropperflagX(){
            if(this.txcropper.flagX){
                this.txcropper.cropper.scaleX(-1);
            }else{
                this.txcropper.cropper.scaleX(1);
            }
            this.txcropper.flagX=!this.txcropper.flagX
           
        },
        /* 关闭 */
        closeCropper(){
            this.hideUpdateInfo();
            this.txcropper.cropper.destroy();
        },
        /* 选择图片 */
        changeAvatar(e){
            var file =e.currentTarget.files[0];
            if(!file){
                return;
            }
            let _this=this;
            var reader = new FileReader();
            reader.onload = function(evt) {
                var f = evt.target;
                var replaceSrc = f.result;
                //更换cropper的图片
                _this.txcropper.cropper.replace(replaceSrc, false);
            };
            reader.readAsDataURL(file);
            $('#toDataURL_group').attr('name',file.name);
        },
        /**获取群信息 */
        // getGroupInfo(groupid){
        //     group.getchatGroupInfo({groupid,userflag:1}).then(res=>{
        //       let avatar = resUrl(res.data.group.avatar)
        //       store.commit('setGetGroupAvatar',res.data.group.avatar)
        //       this.$emit('groupAvatar',avatar)
        //     })
        // },
        async getGroupInfo(groupid){
          let infoData=await group.getWxGroupInfo(groupid,1);
           let avatar = resUrl(infoData.group.avatar)
              store.commit('setGetGroupAvatar',infoData.group.avatar)
              this.$emit('groupAvatar',avatar)
        },
        /* 确定裁剪-上传头像 */
        sureCut(){
            if (!$('#toDataURL_group').attr('src')) {
                msgTips("请选择图片");
                return false;
            } else {
                let _this=this;
                var canvas =  this.txcropper.cropper.getCroppedCanvas(); //获取被裁剪后的canvas
                canvas = this.txcropper.cropper.getCroppedCanvas({
                    minWidth : 1,
                    minHeight : 1
                });
                canvas.toBlob(function (blob) {
                    var fd = new FormData();
                    fd.append("uploadFile", blob, $('#toDataURL_group').attr('name') + ".jpg");
                    fd.append('groupid',_this.userinfo.id)
                    
                    group.modifyAvatar(fd).then(async res=>{
                        _this.closeCropper();
                        if(res.ok){
                          await _this.getGroupInfo(_this.userinfo.id);
                        } else {
                            msgTips(res.msg);
                        }
                    })
                }, "image/jpeg", 1.0);
            }
        },
    }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/currinfo.less";
</style>