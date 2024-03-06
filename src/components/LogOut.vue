<template>
    <!-- 退出登录 -->
    <Dialog v-show="outshow">
        <div class="modelbody">
            <p class="singletitle">确定要退出当前账号吗？</p>
            <div class="button-group">
                <button class="primarybtn default" @click="hideLogOut">取消</button>
                <button class="primarybtn" @click="sureLogOut">确定</button>
            </div>
        </div>
    </Dialog>
</template>
<script>
import {user,msgTips} from '@/axios/path';
import wsSend from '@/assets/js/ws/send';
import { mapState } from "vuex"
import { wscommand } from "@/assets/js/ws/command" //消息码
export default {
    props:['outshow'],
    computed: {
    ...mapState({
      chatOn: (state) => state.Ws.chatOn, //当前会话id
      uid: (state) => state.User.currUid,
    }),
    
  },
    methods:{
        /* 隐藏-退出登录弹框*/
        hideLogOut(){
            this.$emit("update:outshow",false);
        },
        /* 退出登录 */
        sureLogOut(){
            //操作码：1：进入会话；2：离开会话
            if(this.chatOn){
                wsSend(wscommand.WxSessionOperReq, { chatlinkid: this.chatOn, oper: 2 })
            }
            user.changeUserOnlineState({uid:this.uid, isonline:0}).then((res)=>{})
            user.logout().then(res=>{
                location.reload();
            })
        },
    }
}
</script>