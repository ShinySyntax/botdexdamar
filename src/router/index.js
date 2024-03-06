import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login/Login.vue'
import Index from '@/views/Index.vue'
import Home from '@/views/home/Home.vue'
import Friend from '@/views/friend/Friend.vue'
import Group from '@/views/group/Group.vue'
Vue.use(VueRouter)
/* 解决重复路由报错 */
const routerPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
	return routerPush.call(this, location).catch(error => error)
}
const routes = [
	{
		path: '/',
		component: Index,
		children:[
			{
				path: '/home',
				name:'聊天',
				component: Home,	
			},
			{
				path:'/friend',
				name:'好友',
				component:Friend
			},
			{
				path:'/group',
				name:'群聊',
				component:Group
			}
		]
	},
	{
		path: '/login',
		component: Login
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
})

export default router
