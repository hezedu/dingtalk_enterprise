# dingtalk enterprise
钉钉企业号**API**,自带**cache**，并自带**ISV**套件操纵接口。
##安装
```
npm install dingtalk_enterprise
```
##示例
####config:
```js
var DD_enterprise = require('dingtalk_enterprise');

var config = {
  corpid : 'xxxxxxxxxxxxxxxx', //ISV套件控制的话，可不填
  secret : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', //ISV套件控制的话，可不填
  getToken : function(callback){
    //从数据库中取出Token，返回的data样式为：{value: 'xxxxxxx', expires:1452735301543}
    fs.readFile(this.suiteid + 'token.txt',function(err, data){
      if(err){
          return callback(err);
      }
      data = JSON.parse(data.toString());
      callback(null, data);
    });
  },

  saveToken : function(data, callback){
    //存储Token到数据库中，data样式为：{value: 'xxxxxxx', expires:1452735301543//过期时间}
    fs.writeFile(this.suiteid + 'token.txt',JSON.stringify(data), callback);
  },

  getJsApiTicket : function(callback){
    //从数据库中取出JsApiTicket，返回的data样式为：{value: 'xxxxxxx', expires:1452735301543}
    fs.readFile(this.suiteid + 'JsApiTicket.txt',function(err, data){
      if(err){
          return callback(err);
      }
      data = JSON.parse(data.toString());
      callback(null, data);
    });
  },

  saveJsApiTicket : function(data, callback){
    //存储JsApiTicket到数据库中，data样式为：{value: 'xxxxxxx', expires:1452735301543//过期时间}
    fs.writeFile(this.suiteid + 'JsApiTicket.txt',JSON.stringify(data), callback);
  },

  token_expires_in : 1000 * 60 * 60 * 2 - 10000,  //token过期时间，可不填。 默认1小时59分50秒(钉钉规定2小时)，防止网络延迟.
};
```
###创建企业号API：
```js
var api = new DD_enterprise(config);
```
###用ISV套件操作企业号？OK
只需要两个参数：
```js
//newSuiteApi: 一个dingtalk_suite实例。
var suiteCtrlE = new DD_enterprise.CtrlBySuite(newSuiteApi, config);
//只需传入corpid, 和企业号的永久授权码就能控制企业号。
var api = suiteCtrlE.ctrl(corpid, permanent_code);
```
如果你获取永久授权码的同时，获得了token_cache，可以加上第三个参数，这样可以省一次数据库查询。
```js
//token为Object格式 key为: value , expires
var api = suiteCtrlE.ctrl(corpid, permanent_code, token_cache);
```
如果你获取永久授权码的同时，获得了token_cache和jsapi_ticket_cache，可以加上第四个参数，这样可以省两次数据库查询。
```js
//token和jsapi_ticket_cache为Object格式 key为: value , expires
var api = suiteCtrlE.ctrl(corpid, permanent_code, token_cache, jsapi_ticket_cache);
```
___注___:ISV套件主动调用api见： [dingtalk_suite](https://github.com/hezedu/dingtalk_suite)

##代理中间件
### api.agentMiddleware
完全的代理模式，此方法可调用钉钉官方企业号文档的所有接口，而不用管token。
服务端示例:
```js
//例:
//如果是express，什么也不用参数。
app.use('/agent', api.agentMiddleware());


//不是express 怎么办？
app.use('/agent', api.agentMiddleware(
  function(req, res){ //该方法必须是同步的。
    return {
      method: req.method, //钉钉的api方法。 必须
      url: req.url, //钉钉的api的路径。 必须
      errhandler: function(err){ }//错误处理 必须
    }}));
```
客户端仿问ajax示例:
```js
//获取部门列表
//钉钉文档：https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.9aG2FM&treeId=172&articleId=104979&docType=1 获取部门列表
var api = '/department/list'; //跟钉钉的一样。
$.get('/agent' + api, function(data){
  console.log('data', data);
});
```
#### 上传文件示例：
```html
<form action="/agent/media/upload" method="post" enctype="multipart/form-data">
  <input name="type" value="image">
  <input name="media" type="file">
  <input type="submit" value="提交">
</form>
```

***注意***
agentMiddleware为新添加方法，是纯代理模式，跟之前老方法在错误处理上略有不同：它不再判断钉钉errcode了，它返回的结果跟钉钉一样。比如说钉钉返回errcode = 1,之前老方法会报错，而agentMiddleware则不会。

##接口方法
###主要方法
####api.getLatestToken(callback);
获得最新token。
```js
//例:
api.getLatestToken(function(err, token){
  if(err){
   return console.error(err);
  }
  //token格式为：{value: 'xxxxxxx', expires:1452735301543//过期时间}
  console.log('token',token);
});
```
####api.getUrlSign(url, callback);
生成url授权参数，用于前端jsConfig.
```js
//例:
api.getUrlSign('http://www.test.com/path', function(err, result){
  if(err){
    return console.error('error', err);
  }
  /*
  result格式为：{
    signature: '23sadfasdfasdf',
    timeStamp:'24234234234234',
    nonceStr:'asfdasdfasdfasfdx'
  }
  */
  console.log('result',result);
});
```
#以下方法不再推荐使用，只用上面的agentMiddleware足够了。
####api.get(ddApiPath, opts, callback);
代理get方法。使有此方法可调用钉钉官方企业号文档的get接口，而不用管token。
```js
//例:
//获取部门列表
//钉钉文档：http://ddtalk.github.io/dingTalkDoc/?spm=a3140.7785475.0.0.p5bAUd#获取部门列表
api.get('/department/list', function(err, result){
  if(err){
    return console.error('err', err);
  }
  console.log('result', result);
});

//获取部门详情
//钉钉文档：http://ddtalk.github.io/dingTalkDoc/?spm=a3140.7785475.0.0.p5bAUd#获取部门详情
api.get('/department/get', {id:2}, function(err, result){
  if(err){
    return console.error('err', err);
  }
  console.log('result', result);
});
```
####api.post(ddApiPath, opts, callback);
代理post方法。使有此方法可调用钉钉官方企业号文档的post接口，而不用管token。

用法同api.get。

###其它封装的一些方法。
####部门
```js
//获得部门列表
api.getDepartments(callback);

//获得部门详情
api.getDepartmentDetail(id, callback);

//创建部门
api.createDepartment(name, opts, callback);
//例
//名字，父id
api.createDepartment('部门一', 1, callback);
//名字，详细配置
api.createDepartment('部门一', {parentid: 1, order:1}, callback);

//更新部门
api.updateDepartment(id, opts, callback);

//删除部门
api.deleteDepartment(id, callback);

```
####微应用
```js
api.createMicroApp(data, callback);

```
####消息
```js
api.sendToConversation(callback);

api.send(agentid, to, msg, callback);

```
####用户
```js
//获取部门用户
api.getDepartmentUsers(id,callback);

//获取部门用户详细
api.getDepartmentUsersDetail(id,callback);

//获取用户信息
api.getUser(id, callback);

//通过code获取用户一些信息(App登录用)。
api.getUserInfoByCode(code, callback);

```
具体详情请参照[阿里钉钉文档](http://ddtalk.github.io/dingTalkDoc/?spm=a3140.7785475.0.0.p5bAUd#服务端开发文档)

##更多钉钉相关
ISV套件主动调用API: [dingtalk_suite](https://github.com/hezedu/dingtalk_suite)<br>
ISV套件回调server: [dingtalk_suite_callback](https://github.com/hezedu/dingtalk_suite_callback)<br>
ISV SSO 免登API: [dingtalk_sso](https://github.com/hezedu/dingtalk_sso)
