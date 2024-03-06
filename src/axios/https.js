import axios from 'axios';
import router from '@/router/index';
/* 自定义axios实例 */
let instance=axios.create({
    "baseURL":process.env.VUE_APP_apiCtxs,
    // "withCredentials":true,
});
let suffix=process.env.VUE_APP_sufFix;//请求接口地址后缀；例：.php

let _appcode_start=1000;
let appcode = {
    NOTLOGIN : 1 + _appcode_start,  //没有登录
    TIMEOUT : 2 + _appcode_start,//登录超时
    KICKTED : 3 + _appcode_start,// 帐号在其它地方登录
    NO_GRANT : 99 + _appcode_start,// 未授权
}; 
//添加响应拦截器
instance.interceptors.response.use(function (response) {
    let code=response.data.code;
    let currpath=router.history.current.path;
    if(currpath!='/login'&&currpath!='/'){
        if(code==appcode.NOTLOGIN||code==appcode.TIMEOUT||code==appcode.KICKTED){
            location.reload();
            router.push("/login");
        }
    }
    if (code == appcode.NO_GRANT) {
        location.replace(`/2/grant/client/client.html?redirect_uri_after_grant=${encodeURIComponent(location.href)}`);
        return;
    }
    return response;
})
/* post */
export function fetchPost(url, data) {
    url=url+suffix;
    if(typeof data === 'object'){
        data=$.param(data);
    }
    return new Promise((resolve, reject) => {
        instance.post(url,data).then(response => {
            resolve(response.data);
        }).catch((error) => {
            // reject(error);
            info(error);
        })
    })
};

/* get */
export function fetchGet(url,param){
    url=url+suffix;
    return new Promise((resolve, reject) => {
        instance.get(url,{ params: param })
        .then(response => {
            resolve(response.data)
        }).catch((error) => {
            // reject(error);
            info(error);
        })
    })
}
/* 上传文件 */
export function fetchUpload(url,formData){
    url=url+suffix;
    return new Promise((resolve, reject) => {
        instance.post(url,formData,{
            contentType: false,   
            processData: false,
        }).then(response => {
            resolve(response.data)
        }).catch((error) => {
            // reject(error);
            info(error);
        })
    })
}
/* 下载文件 */
export function getFile(url,filename){
  return new Promise((resolve, reject) => {
      instance.get(url,{responseType: 'arraybuffer',
      "responseType": 'blob'}).then(res => {
          resolve(res.data);
      }).catch((err) => {
          error(err);
      })
  })
}