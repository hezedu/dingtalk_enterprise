var agent = require('superagent');
var util = require('./util');
var BASE_URL = 'https://oapi.dingtalk.com';
var TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 2 - 10000 //1小时59分50秒.防止网络延迟

var Api = function(conf){
  if(typeof conf === 'string'){

    this.token_cache = {
      value: conf,
      expires : Infinity
    };

  }else{ 

    this.corpid = conf.corpid;
    this.secret = conf.secret;
    this.SSOsecret = conf.SSOsecret;
    this.token_cache = null;
    this.getToken = conf.getToken || function (callback) {
      callback(null, this.token_cache);
    };

    this.saveToken = conf.saveToken || function (token, callback) {
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
    .query({corpid: self.corpid, corpsecret: self.secret})
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
    console.log(self.token_cache);
    if (self.token_cache.expires  <= now) {

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


Api.prototype.getSSOToken = function(callback) {
  var self = this;
  agent.get(BASE_URL + '/sso/gettoken')
    .query({corpid: self.corpid, corpsecret: self.SSOsecret})
    .end(util.wrapper(callback));
};

//部门
Api.prototype.getDepartments  = function(callback) {
  var self = this;
  
  self.getLatestToken(function(err, token){
    if(err){
      return callback(err);
    };
    agent.get(BASE_URL + '/department/list')
      .query({access_token:token.value})
      .end(util.wrapper(callback));
  });
}

Api.prototype.getDepartmentDetail  = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token){
    if(err){
      return callback(err);
    };
    agent.get(BASE_URL + '/department/get')
      .query({id:id, access_token:token.value})
      .end(util.wrapper(callback));
  });
}

Api.prototype.createDepartment  = function(name, opts, callback) {
  var self = this;
  self.getLatestToken(function(err, token){
    if(err){
      return callback(err);
    };

    if(typeof opts === 'object'){
      opts.name = name;
      opts.parentid = opts.parentid || 1;
    }else{
      opts = {
        name : name,
        parentid : opts
      }
    }
    agent.post(BASE_URL + '/department/create')
      .query({access_token:token.value})
      .send(opts)
      .end(util.wrapper(callback));
  });
}

Api.prototype.updateDepartment  = function(id, opts, callback) {
  var self = this;
  self.getLatestToken(function(err, token){
    if(err){
      return callback(err);
    };

    if(typeof opts === 'object'){
      opts.id = id;
    }else{
      opts = {
        name : opts,
        id : id
      }
    }
    agent.post(BASE_URL + '/department/update')
      .query({access_token:token.value})
      .send(opts)
      .end(util.wrapper(callback));
  });
}

Api.prototype.deleteDepartment  = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token){
    if(err){
      return callback(err);
    };

    agent.get(BASE_URL + '/department/delete')
      .query({id: id, access_token:token.value})
      .end(util.wrapper(callback));
  });
}


//用户
Api.prototype.getDepartmentUsers  = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token){
    if(err){
      return callback(err);
    };

    agent.get(BASE_URL + '/user/simplelist')
      .query({department_id: id, access_token:token.value})
      .end(util.wrapper(callback));
  });
}

Api.prototype.getDepartmentUsersDetail  = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token){
    if(err){
      return callback(err);
    };

    agent.get(BASE_URL + '/user/list')
      .query({department_id: id, access_token:token.value})
      .end(util.wrapper(callback));
  });
}


Api.prototype.getUser  = function(id, callback) {
  var self = this;
  self.getLatestToken(function(err, token){
    if(err){
      return callback(err);
    };

    agent.get(BASE_URL + '/user/get')
      .query({userid: id, access_token:token.value})
      .end(util.wrapper(callback));
  });
}

//微应用

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

//消息
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

//登录
Api.prototype.getUserInfoByCode = function(code, callback) {
  var self = this;
  self.getLatestToken(function(err, token) {
    if (err) {
      return callback(err);
    };

    agent.get(BASE_URL + '/user/getuserinfo')
      .query({
        code : code, 
        access_token: token.value
      })
      .end(util.wrapper(callback));
  });
};

Api.prototype.getSSOUserInfoByCode = function(code, callback) {
  var self = this;
  self.getSSOToken(function(err, token) {
    if (err) {
      return callback(err);
    };
    agent.get(BASE_URL + '/sso/getuserinfo')
      .query({
        code : code, 
        access_token: token.access_token
      })
      .end(util.wrapper(callback));
  });
};


module.exports = Api;