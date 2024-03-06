<template>
    <Dialog v-show="pwdshow">
        <div class="modelbody">
            <p class="title">修改密码</p>
            <el-form :model="form" :rules="rules" class="update-form" ref="updateform">
                <el-form-item prop="oldpwd">
                    <div class="input-row">
                        <label>原密码</label>
                        <el-input  class="user-input" type="password" v-model="form.oldpwd" placeholder="请输入原密码" clearable></el-input>
                    </div>
                </el-form-item>
                <el-form-item prop="newpwd">
                    <div class="input-row">
                        <label>新密码</label>
                        <el-input  class="user-input" type="password" v-model="form.newpwd" placeholder="请输入新密码" clearable></el-input>
                    </div>
                </el-form-item>
                <el-form-item prop="surepwd">
                    <div class="input-row">
                        <label>确认新密码</label>
                        <el-input  class="user-input" type="password" v-model="form.surepwd" placeholder="请确认新密码" clearable></el-input>
                    </div>
                </el-form-item>
            </el-form>
            <div class="button-group">
                <button class="primarybtn default" @click="cancleUpdate">取消</button>
                <button class="primarybtn" @click="saveUpdate" :disabled="loading">保存</button>
            </div>
        </div>
    </Dialog>
</template>
<script>
import CryptoJS from 'crypto-js';//加密
import {user,msgTips} from '@/axios/path';
export default {
    props:['pwdshow'],
    data(){
        let validatePwd= (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请确认新密码'));
            }else if(value!=this.form.newpwd){
                return callback(new Error('两次输入密码不一致'));
            }else{
                callback();
            }
        };
        return {
            loading:false,
            form:{
                oldpwd:'',
                newpwd:'',
                surepwd:''
            },
            rules:{
                oldpwd: [
                     {required: true,message: "请输入原密码",trigger: "blur"}
                ],
                newpwd:[
                    {required: true,message: "请输入新密码",trigger: "blur"}
                ],
                surepwd: [
                    { validator: validatePwd, trigger: 'blur' }
                ],
            }
        }
    },
    methods:{
        /* 取消 */
        cancleUpdate(){
            this.$emit("hideUpdatePwd",false);
            this.$refs['updateform'].resetFields();
        },
        /* 保存-修改密码 */
        saveUpdate(){
            this.$refs.updateform.validate(async (valid) => {
                if (valid) {
                    this.loading=true;
                    let curruser=this.$store.state.User.currUser;
                    let {oldpwd,newpwd}=this.form;
                    //防止build后不能正确拼接的问题
                    let	key1='$',
                        key2='{',
                        key3='}';
                    let postdata={initPwd:oldpwd};
                    if(curruser.phone){
                        let palinstr= `${key1}${key2}${curruser.phone}${key3}${newpwd}`,
                        newPwd=CryptoJS.MD5(CryptoJS.enc.Latin1.parse(palinstr)).toString();
                        postdata.newPwd =newPwd
                    }
                    if(curruser.email){
                        let palinstr1= `${key1}${key2}${curruser.email}${key3}${newpwd}`,
                        emailpwd=CryptoJS.MD5(CryptoJS.enc.Latin1.parse(palinstr1)).toString();
                         postdata.emailpwd =emailpwd
                    }
                    let res=await user.updatePwd(postdata)
                    if(res.ok){
                        user.logout().then(res=>{
                            location.reload();
                        })
                        msgTips("修改成功,请重新登录");
                    }else{
                        msgTips(res.msg);
                    }
                    this.loading=false;
                }
            })
        }
    }
}
</script>
<style lang="less" scoped>
.modelbody{
    width:373px;
    .update-form{
        padding:0 30px;
    }
    .title{
        padding-left:30px;
        line-height: 60px;
    }
    .el-form-item{
        margin-bottom:0px;
        /deep/.el-form-item__content{
            line-height: 27px;
            margin:10px 0;
            .el-form-item__error{
                left:80px;
            }
        }
    }
    .input-row{
        .flexbox;
        label{
            font-size:12px;
            width:74px;
            text-align: left;
            flex-shrink: 0;
            color:#999;
            line-height: 27px;
        }
        .user-input {
            height: 27px;
            line-height: 27px;
        }
        /deep/.el-input__inner{
            padding-left: 7px;
            height: 27px;
            border-color: #F1F1F1;
            &:focus{
                border-color: #F1F1F1;
            }
        }
        /deep/.el-input__icon{
            line-height: 27px;
        }
    }
    .button-group{
        margin-top:30px;
    }
}
</style>