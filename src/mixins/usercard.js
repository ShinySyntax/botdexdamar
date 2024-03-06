import {friend,msgTips} from '@/axios/path';
import {resUrl,setContextmenu } from '@/assets/js/common';
import {mapActions} from 'vuex';
const UserCardMixins={
    data(){
        return {
            userCard:{//用户名片
                top:0,
                left:0,
                data:{},
                isfriend:false
            },
            cardshow:false,//用户名片显示状态
        }
    },
    methods:{
        ...mapActions(['getUserInfo']),
        /* 
        *用户头像点击 用户信息框
        * @param {*} e 
        * @param {*} v 
        */
       async showUserCard(e,uid,v){
            document.documentElement.click();
            // document.documentElement.click();
            let userInfo=await this.getUserInfo(uid);
            userInfo.avatar=resUrl(userInfo.avatar);
            if(v){
                Object.assign(userInfo,{greet:v.greet});
            }
            let isfriend=await friend.isMyFriend(uid);
            let pos=setContextmenu(e,250,250);
            this.userCard={//新的朋友点击显示用户名片
                top:pos.otop,
                left:pos.oleft,
                data:userInfo,
                isfriend:isfriend==1?true:false,
            };
            this.cardshow=true;
        },
    }
};
export default UserCardMixins;