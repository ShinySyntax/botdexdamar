import Vue from 'vue';
/* 设置监听 */    
Vue.prototype.$setAddEventListener = function (item) {
    let _this=this;
    document.addEventListener('click', function(e){_this.$unbindListen(e,item)}, false);
};
/* 解绑监听 */
Vue.prototype.$unbindListen=function (e,item) {
    this[item]=false;
    document.removeEventListener('click', this.$unbindListen, false)
}
