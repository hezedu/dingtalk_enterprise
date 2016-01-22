var agent = require('superagent');
var crypto = require('crypto');
var util = require('./util');
var BASE_URL = 'https://oapi.dingtalk.com';
var TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 2 - 10000 //1小时59分50秒.防止网络延迟

var Api = function(conf) {
  if (typeof conf === 'string') {

    this.token_cache = {
      value: conf,
      expires: Infinity
    };
    
    if(arguments[1]){
      this.jsapi_ticket_cache = {
        value: arguments[1],
        expires: Infinity
      };
    }


  } else {

    this.corpid = conf.corpid;
    this.secret = conf.secret;
    this.SSOsecret = conf.SSOsecret;
    this.token_cache = null;
    this.jsapi_ticket_cache = null;
    this.getJsApiTicket = conf.getJsApiTicket;
    this.saveJsApiTicket = conf.saveJsApiTicket;

    this.getToken = conf.getToken || function(callback) {
      callback(null, this.token_cache);
    };

    this.saveToken = conf.saveToken || function(token, callback) {
      this.token_cache = token;
      if (process.env.NODE_ENV === 'production') {
        console.warn('Don\'t save token in memory, when cluster or multi-computer!');
      }
      callback(null);
    };
    this.token_expires_in = conf.token_expires_in || TOKEN_EXPIRES_IN;
  }
}

Api.prototype._get_access_token = function(callback) {
  var self = this;
  agent.get(BASE_URL + '/gettoken')
    .query({
      corpid: self.corpid,
      corpsecret: self.secret
    })
    .end(util.wrapper(callback));
};

Api.prototype.getLatestToken = function(callback) {
  var self = this;
  if (!self.token_cache) {
    self.getToken(function(err, token) {
      if (err) {
        return callback(err);
      } else {
        self.token_cache = token;
        self.getLatestToken(callback);
      }
    });
  } else {
    var now = Date.now();

    if (self.token_cache.expires <= now) {

      self._get_access_token(function(err, token) {
        if (err) {
          return callback(err);
        } else {
          token = {
            value: token.access_token,
            expires: now + self.token_expires_in
          }
          self.saveToken(token, function(err) {
            if (err) {
              return callback(err);
            }
            self.token_cache = token;
            callback(null, token);
          });
        }
      });
    } else {
      callback(null, this.token_cache);
    }
  }
}


//=============================== 部门 ===============================

Api.prototype.getDepartments = function(callback) {
  var self = this;

  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };
    agent.get(BASE_URL + '/department/list')
      .query({
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
}

Api.prototype.getDepartmentDetail = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };
    agent.get(BASE_URL + '/department/get')
      .query({
        id: id,
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
}

Api.prototype.createDepartment = function(name, opts, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    if (typeof opts === 'object') {
      opts.name = name;
      opts.parentid = opts.parentid || 1;
    } else {
      opts = {
        name: name,
        parentid: opts
      }
    }
    agent.post(BASE_URL + '/department/create')
      .query({
        access_token: token.value
      })
      .send(opts)
      .end(util.wrapper(callback));
  });
}

Api.prototype.updateDepartment = function(id, opts, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    if (typeof opts === 'object') {
      opts.id = id;
    } else {
      opts = {
        name: opts,
        id: id
      }
    }
    agent.post(BASE_URL + '/department/update')
      .query({
        access_token: token.value
      })
      .send(opts)
      .end(util.wrapper(callback));
  });
}

Api.prototype.deleteDepartment = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    agent.get(BASE_URL + '/department/delete')
      .query({
        id: id,
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
}

//=============================== 微应用 ===============================

Api.prototype.createMicroApp = function(data, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    agent.post(BASE_URL + '/microapp/create')
      .query({
        access_token: token.value
      })
      .send(data)
      .end(util.wrapper(callback));
  });
};

//=============================== 消息 ===============================
//
Api.prototype.sendToConversation = function(callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    agent.post(BASE_URL + '/message/send_to_conversation')
      .query({
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
};

//=============================== 用户 ===============================

Api.prototype.getDepartmentUsers = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    agent.get(BASE_URL + '/user/simplelist')
      .query({
        department_id: id,
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
}

Api.prototype.getDepartmentUsersDetail = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    agent.get(BASE_URL + '/user/list')
      .query({
        department_id: id,
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
}


Api.prototype.getUser = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    agent.get(BASE_URL + '/user/get')
      .query({
        userid: id,
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
}

//登录
Api.prototype.getUserInfoByCode = function(code, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    agent.get(BASE_URL + '/user/getuserinfo')
      .query({
        code: code,
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
};

//=============================== SSO ===============================

Api.prototype.getSSOToken = function(callback) {
  var self = this;
  agent.get(BASE_URL + '/sso/gettoken')
    .query({
      corpid: self.corpid,
      corpsecret: self.SSOsecret
    })
    .end(util.wrapper(callback));
};

//登录
Api.prototype.getSSOUserInfoByCode = function(code, callback) {
  var self = this;
  self.getSSOToken(function(err, token) {
    if (err) {
      return callback(err);
    };
    agent.get(BASE_URL + '/sso/getuserinfo')
      .query({
        code: code,
        access_token: token.access_token
      })
      .end(util.wrapper(callback));
  });
};


//=============================== jsApi Ticket ===============================

Api.prototype._get_jsApi_ticket = function(callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };
    agent.get(BASE_URL + '/get_jsapi_ticket')
      .query({
        type: 'jsapi',
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
};



/*Api.prototype.getLatest = function(key, dd) {
  var self = this;
  var cache = self[key + 'Cache'];
  var save = self['save' + key];
  var get = self['get' + key];

  function _getLatest(callback) {
    if (!cache) {

      get(function(err, data) {
        if (err) {
          return callback(err);
        } else {
          self.jsapi_ticket_cache = data;
          self.getLatestJsApiTicket(callback);
        }
      });
    }
  }
  return _getLatest;
}*/


Api.prototype.getLatestJsApiTicket = function(callback) {
  var self = this;

  if (!self.jsapi_ticket_cache) {
    self.getJsApiTicket(function(err, data) {
      if (err) {
        return callback(err);
      } else {
        self.jsapi_ticket_cache = data;
        self.getLatestJsApiTicket(callback);
      }
    });
  } else {
    var now = Date.now();
    if (self.jsapi_ticket_cache.expires <= now) {

      self._get_jsApi_ticket(function(err, data) {
        if (err) {
          return callback(err);
        } else {
          data = {
            value: data.ticket,
            expires: now + self.token_expires_in
          }
          self.saveJsApiTicket(data, function(err) {
            if (err) {
              return callback(err);
            }
            self.jsapi_ticket_cache = data;
            callback(null, data);
          });
        }
      });
    } else {
      callback(null, this.jsapi_ticket_cache);
    }
  }
}


var createNonceStr = function() {
  return Math.random().toString(36).substr(2, 15);
};

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort();
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  return string.substr(1);
};

var sign = function(ret) {
  var string = raw(ret);
  var shasum = crypto.createHash('sha1');
  shasum.update(string);
  return shasum.digest('hex');
};



/*Api.prototype.generate = function(param, callback){


}*/

Api.prototype.getUrlSign = function(url, callback) {
  var self = this;
  self.getLatestJsApiTicket(function(err, data) {
    if (err) {
      return callback(err);
    }

    var result = {
      noncestr: createNonceStr(),
      jsapi_ticket: data.value,
      timestamp: Date.now(),
      url: url
    }

    var signature = sign(result);
    result = {
      signature: signature,
      timeStamp: result.timestamp,
      nonceStr: result.noncestr
    }
    callback(null, result);
  });
}

//=============================== ISV Suite Ctrl ===============================

Api.CtrlBySuite = function(newSuiteApi, conf) {
  for (var i in conf) {
    this[i] = conf[i];
  }
  this.newSuiteApi = newSuiteApi;
}

Api.CtrlBySuite.prototype.ctrl = function(corpid, permanent_code, token_cache, jsapi_ticket_cache) {

/*  if (typeof corpid === 'object') { //考虑到SSO，所以多加了个选择
    if(corpid.token){
      this.token_cache = corpid.token;
      this.jsapi_ticket_cache = corpid.jsapi_ticket;
      delete(corpid.token);
    }
    permanent_code = corpid.permanent_code;
    for (var i in corpid) {
      this[i] = corpid[i];
    }

  } else {

  }*/

  this.corpid = corpid;
  this.token_cache = token_cache;
  this.SSOSecret = this.newSuiteApi.SSOSecret;
  this.jsapi_ticket_cache = jsapi_ticket_cache;

  var api = new Api(this);
  var newSuiteApi = this.newSuiteApi;
  api._get_access_token = function(callback) {
    newSuiteApi.getCorpToken(corpid, permanent_code, callback);
  }
  return api;
}


module.exports = Api;