<template>
    <div class="tioimcontainer">
        <div class="bodycontent" id="bodycontent">
            <NavBar></NavBar>
            <router-view></router-view>
        </div>
        <Call></Call>
        <!-- <div class="navbar">
        </div> -->
    </div>
</template>
<script>
import NavBar from "@/components/NavBar.vue"
import Call from "@/components/Call.vue"
import {user,msgTips} from '@/axios/path';
import { mapState } from "vuex"
export default {
    data(){
        return {

        }
    },
    computed: {
        ...mapState({
        chatOn: (state) => state.Ws.chatOn, //当前会话id
        uid: (state) => state.User.currUid,
        }),
    
    },
    components:{
        NavBar,
        Call
    },
    mounted() {
        // 添加 visibilitychange 事件监听器
        window.addEventListener('visibilitychange', this.handleVisibilityChange);
    },
    beforeDestroy() {
        // 移除 visibilitychange 事件监听器
        window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    },
    methods: {
        handleVisibilityChange() {
        if (!document.hidden) {
            console.log("Window is now visible");
            // this.$router.go(0);
            // 处理窗口显示时的逻辑
            user.changeUserOnlineState({uid:this.uid, isonline:1}).then((res)=>{})
        } else {
            console.log("Window is now hidden");
            // 处理窗口隐藏时的逻辑
            user.changeUserOnlineState({uid:this.uid, isonline:0}).then((res)=>{})
        }
        }
    }
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/index.less";
</style>
