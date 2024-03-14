<template>
<div class="mainbody">
	<div class="listcontent">
		<!-- 搜索 -->
		<Search :show.sync="searchShow"></Search>
		<!-- 好友列表 -->
		<FriendList ref="friendlist" v-show="!searchShow" :type="type" :friendInfo="friendInfo"  @setFriendInfo="setFriendInfo" @setType="setType" @sendCard="sendCard" @sendMsg="sendMsg" @delFriend="delFriend"></FriendList>
	</div>
	<!-- 好友信息 -->
	<FriendInfo ref="friendinfo" :type="type" :friendInfo="friendInfo" @sendCard="sendCard" @setFriendInfo="setFriendInfo"></FriendInfo>
	<!-- 发送名片 -->
	<TransMsg :transShow.sync="sendShow" :transType="sendType" :transData="data"></TransMsg>
</div>
</template>

<script>
import {mapMutations} from 'vuex';
import Search from '@/components/Search';//搜索
import FriendList from '@/components/friend/FriendList';//好友列表
import FriendInfo from '@/components/friend/FriendInfo';//好友信息
import TransMsg from "@/components/home/TransMsg";//转发消息
export default {
	data(){
		return {
			searchShow:false,//搜索显示状态
			friendInfo:{},//好友信息
			type:1,//右侧显示类型  1:新的朋友 ；2:好友信息
			sendShow:false,//发送名片弹框显示状态
			sendType:2,
			data:{},
		}
	},
	components:{
		Search,
		FriendList,
		FriendInfo,
		TransMsg
	},
	mounted(){
		this.setApplyThis(this);//设置本页面的this对象
	},
	methods:{
		...mapMutations(['setApplyThis']),
		/* 设置好友uid */
		setFriendInfo(val){
			this.friendInfo=val;
		},
		/* 设置右侧显示类型 */
		setType(val){
			this.type=val;
		},
		/* 发送名片 */
		sendCard(item){
			// this.data.uid=uid;
			this.data={...item};
			this.sendShow=true;
		},
		/* 发消息 */
		sendMsg(uid){
			this.$refs.friendinfo.sendMessage(uid);
		},
		/* 删除好友 */
		delFriend(uid){
			this.$refs.friendinfo.delFriend(uid);
		}
	}
  
}
</script>
<style lang="less" scoped>
@import "~@/assets/style/less/components/search.less";
@import "~@/assets/style/less/home/home.less";
</style>
