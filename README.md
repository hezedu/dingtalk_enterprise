# dingtalk enterprise
钉钉企业号**API**,自带**cache**，并自带**ISV**套件操纵接口。
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
  }
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

##接口方法
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

####jsApi
```js
//生成url授权参数。用于前端jsConfig.
//只需传入一个url字符串参数，callback返回：
/*
signature: '23sadfasdfasdf',
timeStamp:'24234234234234',
nonceStr:'asfdasdfasdfasfdx'
*/
api.getUrlSign(url, callback);

```
##更多钉钉相关
ISV套件主动调用API: [dingtalk_suite](https://github.com/hezedu/dingtalk_suite)<br>
ISV套件回调server: [dingtalk_suite_callback](https://github.com/hezedu/dingtalk_suite_callback)<br>
ISV SSO 免登API: [dingtalk_sso](https://github.com/hezedu/dingtalk_sso)

