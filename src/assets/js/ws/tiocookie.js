if (typeof tio == "undefined") {
  var tio = {};
}
tio.CookieCls = function() {
  var self = this;

  this.cks = {}; // cookies key: name, value: []

  this.isIp = function(str) {
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return reg.test(str);
  };

  this.init = function() {
    var initCookies = document.cookie ? document.cookie.split("; ") : [];
    for (var index = 0; index < initCookies.length; index++) {
      var e = initCookies[index]; // phpsession=uioikkjhj
      var indexOfEqual = e.indexOf("=");
      if (indexOfEqual == -1) {
        continue;
      }

      var name = e.substr(0, indexOfEqual);
      var value = e.substring(indexOfEqual + 1);
      if (!self.cks[name]) {
        self.cks[name] = [];
      }
      self.cks[name].push(value);
    }
    // log(JSON.stringify(self.cks))
  };

  /**
   * 返回的是数组，数组长度可能是大于1
   */
  this.get = function(name) {
    return self.cks[name] || null;
  };
  /**
   * 获取最新设置的cookie
   */
  this.getLast = function(name) {
    var arr = self.get(name);
    if (arr) {
      return arr[arr.length - 1];
    }
    return null;
  };
  /**
   * 设置cookie
   * param: attr
   *  expires属性，单位是天
   */
  this.set = function(name, value, attr) {
    var nv = name + "=" + encodeURIComponent(value); // + ';domain=' + rootDomain + ';max-age=' + 0 + ';path=/'
    var hasPath = false;
    if (arguments.length == 3) {
      for (var key in attr) {
        var v = attr[key];

        if (key == "expires") {
          if (typeof v === "number") {
            var expires = new Date();
            expires.setMilliseconds(expires.getMilliseconds() + v * 864e5);
            v = expires.toUTCString();
          }
        }

        if (key == "path") {
          hasPath = true;
        }

        nv += ";" + key + "=" + v;
      }
    }

    if (!hasPath) {
      nv += ";path=/"; // + v
    }

    document.cookie = nv;
  };
  //
  this.remove = function(name) {
    var values = self.get(name);
    if (!values) {
      return;
    }

    // var exp = new Date()
    // exp.setTime(exp.getTime() - 1)
    // var expStr = exp.toUTCString()

    var rootDomain = location.hostname;
    var xxx = location.hostname.split(".");
    var isip = self.isIp(location.hostname);
    // log("is ip:" + isip)
    if (!isip) {
      if (xxx.length > 2) {
        rootDomain = xxx[xxx.length - 2] + "." + xxx[xxx.length - 1];
      }
    }

    var nv = "";
    for (var index = 0; index < values.length; index++) {
      var value = values[index];

      nv =
        name +
        "=" +
        encodeURIComponent(value) +
        ";domain=" +
        rootDomain +
        ";max-age=" +
        0 +
        ";path=*";
      document.cookie = nv;

      nv = name + "=" + encodeURIComponent(value) + ";max-age=" + 0 + ";path=*";
      document.cookie = nv;
    }
  };
  /**
   * 删除重名的cookie
   * name如果为不传，则删除全部重名的cookie
   * return true:有删除，false:没有删除
   */
  this.removeIfRepeat = function(name) {
    if (arguments.length == 1) {
      var values = self.get(name);
      if (!values || values.length <= 1) {
        return false;
      }
      // alert(JSON.stringify(arguments))
      // log('准备删除cookie: ' + name)
      self.remove(name);
      return true;
    } else {
      var ret = false;
      for (var key in self.cks) {
        // log('----key:' + key + '--------value:' + JSON.stringify(self.cks[key]))
        var flag = self.removeIfRepeat(key); // 不要写成: ret = self.removeIfRepeat(key) || ret，因为这样很容易出错
        if (flag == true) {
          ret = true;
        }
      }
      return ret;
    }
  };
};

tio.cookie = new tio.CookieCls();
tio.cookie.init();
let tioCookie=tio.cookie;
export default tioCookie;
// 获取cookie
// log('获取PHPSESSID', tio.cookie.get('PHPSESSID'))  //返回的是数组

// 删除名为PHPSESSID的重名cookie(如果当前域下有多个名为PHPSESSID的cookie，则删除所有名为PHPSESSID的cookie，没有多个则不删除)
// tio.cookie.removeIfRepeat('PHPSESSID')

// 删除所有重名的cookie
// tio.cookie.removeIfRepeat()

// 删除名为PHPSESSID的cookie
// tio.cookie.remove('PHPSESSID')

//设置cookie 有效期一天
//tio.cookie.set("phpsessionid", "iujkhutrlkjlkgfg453dfd8g674987gfd", {expires: 1})
