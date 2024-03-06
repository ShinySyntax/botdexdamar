import {group,msgTips} from '@/axios/path';
const state={
    groupUserInfo:{},
    forbiddenInfo:{}
}
const actions={
    getChatGroupInfo({commit},groupid){
        group.getchatGroupInfo({groupid,userflag:1}).then(res=>{
            if(res.ok){
                commit('setGetGroupUserInfo',res.data)
            }
        })
    },
    getchatForbiddenFlag({commit},postdata){
        group.chatForbiddenFlag(postdata).then(res=>{
            if(res.ok){
                commit('setForbiddenInfo',res.data)
            }
        })
    }   


}
const mutations={
    setGetGroupUserInfo(state,val){
        state.groupUserInfo = val
    },
    setForbiddenInfo(state,val){
        state.forbiddenInfo = val
    },
    setGetMsgFree(state,val){
        state.groupUserInfo.groupuser.msgfreeflag = val
    },
    setGetGroupAvatar(state,val){
        state.groupUserInfo.group.avatar = val
    },
}
export default {
  state,
  actions,
  mutations
}