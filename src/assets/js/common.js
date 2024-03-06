import WebStorageCache from "web-storage-cache"
import { fetchGet } from "@/axios/http"
import { replaceEmoji } from "@public/static/emoji/emojUtil"
import tioCookie from "@/assets/js/ws/tiocookie"
import mCustomScrollbar from "malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js" //滚动条插件
import "malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css"

/**
 * //上传资源服务器
 * 1、res_url("/user/xxx.jpg");
 * 2、res_url(path);
 * @param {*} path
 */
function resUrl(path) {
  let sessionConfig = JSON.parse(sessionStorage.getItem("tiocomconfig"))
  let res_server = sessionConfig.res_server
  if (path) {
    var isAbPath = path.indexOf("http://")
    var isAbsPath = path.indexOf("https://")
    if (isAbPath >= 0 || isAbsPath >= 0) {
      return path
    } else {
      if (path.indexOf("/") == 0) {
        return res_server + path
      } else {
        return res_server + "/" + path
      }
    }
  } else {
    return null
  }
}
let wsCache = new WebStorageCache({
  storage: "sessionStorage",
}) //本地存储Cache

/* 设置缓存 */
let tioCache = {
  splitStr: "_&_:",
  /**
   * @param {*} cacheName
   * @param {*} key
   * @param {*} value
   * @param {*} options 譬如缓存一小时: {exp: 3600 * 1}
   */
  set: function(cacheName, key, value, options) {
    wsCache.set(cacheName + tioCache.splitStr + key, value, options)
  },
  get: function(cacheName, key) {
    var ret = wsCache.get(cacheName + tioCache.splitStr + key)
    return ret
  },
  remove: function(cacheName, key) {
    wsCache.delete(cacheName + tioCache.splitStr + key)
  }
}
/**
 * 经过缓存获取数据：先从缓存中取，如果缓存没有，则通过fun获取
 * @param {*} cacheName
 * @param {*} key
 * @param {*} exp
 * @param {*} fun 缓存没有数据时，通过该方法获取数据，本方法需要返回数据
 */
async function getWithCache(cacheName, key, exp, fun) {
  var data = null
  data = tioCache.get(cacheName, key)
  if (data) {
    return data
  }
  data = await fun.call(fun)
  if (data) {
    tioCache.set(cacheName, key, data, { exp: exp })
  }
  return data
}

/**
 * 格式化文件大小, 输出成带单位的字符串
 * @param {Number} size 文件大小
 * @param {Number} [pointLength=2] 精确到的小数点数。
 * @param {Array} [units=[ 'B', 'K', 'M', 'G', 'TB' ]] 单位数组。从字节，到千字节，一直往上指定。
 *    如果单位数组里面只指定了到了K(千字节)，同时文件大小大于M, 此方法的输出将还是显示成多少K.
 */
function formatSize(size, pointLength, units) {
  if (!size) {
    return "0"
  }

  var initsize = size

  var unit
  units = units.concat() || ["B", "K", "M", "G", "TB"]
  while ((unit = units.shift()) && size > 1024) {
    size = size / 1024
  }
  return (
    /*initsize + "_" + */ (unit === "B"
      ? size
      : size.toFixed(pointLength === undefined ? 2 : pointLength)) + unit
  )
}

/**
 * 格式化文件大小, 输出成带单位的字符串，譬如2K、3M等
 */
function formatSize1(size) {
  return formatSize(size, 2, ["B", "K", "M", "G", "TB"])
}
/**
 * beautify Date 美化时间
 * 返回：刚刚、几分钟前、几小时前、几年前等
 * @param {*} dateStr
 */
function btDate(dateStr) {
  if (isBlank(dateStr)) {
    return ""
  }

  var s1 = Date.parse(dateStr.replace(/-/g, "/"))
  var s2 = new Date().getTime()
  var iv = s2 - s1

  var m = Math.round(iv / (1000 * 60)) //经历了多少分钟
  var hour
  var day
  var year
  // 一年525600分钟
  if (m < 1) {
    return "刚刚"
  } else if (m >= 1 && m < 59) {
    return m + "分钟前"
  } else if (m >= 60) {
    hour = Math.round(m / 60) //经历了多少小时
    if (m < 1440) {
      return hour + "小时前"
    } else {
      day = Math.round(hour / 24) //经历了多少天
      if (day <= 365) {
        return day + "天前"
      } else {
        year = Math.round(day / 365) //经历了多少年
        if (year <= 10) {
          return year + "年前"
        } else {
          return "很久以前"
        }
      }
    }
  }

  return ""
}
/**
 * 日期格式化
 * @param {*} time  时间戳
 * @param {*} fmt  格式：yyyy-MM-dd HH:mm:ss
 */
function formatDateByTime(time, fmt) {
  var date = new Date()
  date.setTime(time)
  var o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "H+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    )
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      )
    }
  }
  return fmt
}
/* 判断值 */
function isBlank(value) {
  if (value === null || value === undefined || $.trim(value) === "") {
    return true
  }
  return false
}
/* base64转blob */
function dataURLtoBlob(dataurl) {
  if (dataurl == "data:") {
    return
  }
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
/* 处理消息体中的表情 */
function messageEmoji(str) {
  if (!str) {
    return
  }
  if (str.match(/\[([^(\]|\[)]*)\]/g) != null) {
    str = replaceEmoji(str)
  }
  return str
}
// 获取指定名称的cookie
function getCookie(name) {
  var strcookie = document.cookie //获取cookie字符串
  var arrcookie = strcookie.split("; ") //分割
  //遍历匹配
  for (var i = 0; i < arrcookie.length; i++) {
    var arr = arrcookie[i].split("=")
    if (arr[0] == name) {
      return decodeURIComponent(arr[1])
    }
  }
  return ""
}
/* 防抖 delay延时 */
function debounce(fn, delay) {
  var debounce_timer
  return function() {
    let debounce_context = this
    let debounce_args = arguments
    clearTimeout(debounce_timer)
    debounce_timer = setTimeout(function() {
      fn.apply(debounce_context, debounce_args)
    }, delay)
  }
}

/* 
消息时间处理 
@param{*} msgtime 时间 例：2015-08-23
@param{*} type 时间返回格式 
*/
function getShowTime(msgtime, type) {
  if (!msgtime) {
    return ""
  }
  let milliseconds = new Date(Date.parse(msgtime.replace(/-/g, "/"))).getTime()

  let msgYear = new Date(Date.parse(msgtime.replace(/-/g, "/"))).getFullYear()
  let nowYear = new Date().getFullYear()
  // 输入时间（日期）
  var inputData = new Date(milliseconds)
  // 输入时间（时分）
  var inputTime24 = formatDateByTime(milliseconds, "HH:mm")
  var todate = new Date().getTime()
  var toyear = formatDateByTime(todate, "yyyy-MM-dd").replace(/-/g, "/")
  var todayStart = new Date(toyear + " 00:00:00").getTime()
  var todayEnd = new Date(toyear + " 23:59:59").getTime()
  // 今天的开始
  // 昨天的开始
  var yesterdayBegin = todayStart - 3600 * 24 * 1000
  // 前天的开始
  var preYesterdayBegin = todayStart - 3600 * 24 * 1000

  var dataString

  if (milliseconds > todayStart && milliseconds < todayEnd) {
    // 今天
    dataString = type ? btDate(msgtime) : inputTime24
  } else if (milliseconds > yesterdayBegin) {
    // 昨天
    dataString = "昨天 " + inputTime24
  } else if (milliseconds > preYesterdayBegin) {
    // 前天
    dataString = "前天 " + inputTime24
  } else if (msgYear == nowYear) {
    // 本年
    dataString = formatDateByTime(milliseconds, "MM-dd HH:mm")
  } else {
    // 其他
    dataString = formatDateByTime(milliseconds, "yyyy-MM-dd HH:mm")
  }
  return dataString
}
/**
 * 毫秒格式化为时分秒
 * @param {*} s  毫秒
 */
function formatMilliseconds(s) {
  var t = ""
  s = s / 1000
  if (s > -1) {
    var min = Math.floor(s / 60) % 60
    var sec = parseInt(s % 60)

    if (min < 10) {
      min = "0" + min
    }
    t += min + ":"
    if (sec < 10) {
      sec = "0" + sec
    }
    t += sec
  }
  return t
}

/**
 *自定义滚动条
 * @param {*} dom 滚动区域dom 例$("#list")
 * @param {*} scrollTop 滚动初始位置
 * @param {*} cb 回调函数
 * @param {*} options 其他配置
 */
function defineScroll(dom, scrollTop, cb, options) {
  dom.mCustomScrollbar("destroy")
  dom.mCustomScrollbar({
    scrollbarPosition: "outside",
    theme: "minimal-dark",
    // scrollInertia: 0,
    // scrollInertia:2000,
    mouseWheel: { preventDefault: true },
    setTop: scrollTop ? scrollTop : 0,
    callbacks: cb ? cb : {},
    updateOnImageLoad: true,
    // updateOnSelectorChange: '#chat-center li',
    // scrollEasing:'linear',
    // mouseWheel:{scrollAmount:200},
    ...options,
  })
}
/* 定义右键弹框位置 */
function setContextmenu(e, h = 0, w = 0) {
  let realWidth = $(window).width() //浏览器宽度
  let realHeight = $(window).height() //浏览器高度
  let otop =
    e.pageY - (document.body.scrollHeight - $("#bodycontent").height()) / 2
  if (realHeight - otop <= h) {
    otop = realHeight - h
  }
  otop = otop + "px"
  let dew = 0
  if (realWidth - e.pageX <= w) {
    dew = w
  }
  let oleft =
    e.pageX -
    (document.body.scrollWidth - $("#bodycontent").width()) / 2 -
    dew +
    "px"
  return { otop, oleft }
}
function getBase64(img) { // 传入图片路径，返回base64
  let picImage = new Image();
  picImage.setAttribute("crossOrigin", "anonymous");
  let deferred = $.Deferred();
  if (img) {
      picImage.onload = function () {
        deferred.resolve(getBase64Image(picImage)); // 将base64传给done上传处理
      };
      picImage.src = img;
      return deferred.promise(); // 要让onload完成后再return sessionStorage['imgTest']
  }
}
// 转换为base4的主要方法
function getBase64Image(img, width, height) {
  let canvas = document.createElement('canvas');
  canvas.width = width || img.width;
  canvas.height = height || img.height;
  let ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  let dataURL = canvas.toDataURL();
  return dataURL;
}
function convertBase64ToBlob(base64) {
  var base64Arr = base64.split(',');
  var imgtype = '';
  var base64String = '';
  if (base64Arr.length > 1) {
      // 如果是图片base64，去掉头信息
      base64String = base64Arr[1];
      imgtype = base64Arr[0].substring(base64Arr[0].indexOf(':') + 1, base64Arr[0].indexOf(';'));
  }
  // 将base64解码，atob() 方法用于解码使用 base-64 编码的字符串。
  var bytes = atob(base64String);
  var bytesCode = new ArrayBuffer(bytes.length);
  // 转换为类型化数组
  var byteArray = new Uint8Array(bytesCode);
  // 将base64转换为ascii码
  for (var i = 0; i < bytes.length; i++) {
      byteArray[i] = bytes.charCodeAt(i);
  }
  // 生成Blob对象（文件对象）
  return new Blob([bytesCode], {type: imgtype});
};
/**
 * 该方法可以修改url的参数。
例如将
　　tiocloud.com
修改为
　　tiocloud.com?name=123
操作为：
　　window.location.href = changeURLArg(window.location.href,'name',123)
 * @param {*} url 
 * @param {*} arg 
 * @param {*} arg_val 
 */
function changeURLArg(url, arg, arg_val) {
  var pattern = arg + '=([^&]*)';
  var replaceText = arg + '=' + arg_val;
  if (url.match(pattern)) {
      var tmp = '/(' + arg + '=)([^&]*)/gi';
      tmp = url.replace(eval(tmp), replaceText);
      return tmp;
  } else {
      if (url.match('[\?]')) {
          return url + '&' + replaceText;
      } else {
          return url + '?' + replaceText;
      }
  }
}

/**
* 示例
* changeURLArgs([
      ['pageNumber', pageNumber], 
      ['pageSize', pageSize]
  ]);
* @param {*} arrs 
*/
function changeURLArgs(arrs) {
  var newurl = window.location.href;

  for (var index = 0; index < arrs.length; index++) {
      var arr = arrs[index];
      if (arr[1] != null) {
          newurl = changeURLArg(newurl, arr[0], arr[1]);
      }
  }

  var data = null;
  var title = null;
  history.pushState(data, title, newurl);
}
/**
 * 获取url的参数值
 * @param {*} name 
 */
function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
      var v = r[2];
      return decodeURIComponent(v);
  }
  return null;
}
export {
  resUrl,
  tioCache,
  formatSize1,
  btDate,
  getCookie,
  formatDateByTime,
  dataURLtoBlob,
  getWithCache,
  messageEmoji,
  debounce,
  getShowTime,
  formatMilliseconds,
  defineScroll,
  setContextmenu,
  getBase64,
  convertBase64ToBlob,
  changeURLArgs,
  getQueryString
}
