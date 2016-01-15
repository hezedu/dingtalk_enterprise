/*!
 * 对返回结果的一层封装，如果遇见微信返回的错误，将返回一个错误
 * 参见：http://mp.weixin.qq.com/wiki/index.php?title=返回码说明
 */
exports.wrapper = function (callback) {
  return function (err, data) {
    if (err) {
      err.name = 'DingTalkAPI' + err.name;
      return callback(err, data);
    }
    data = data.body;
    if (data.errcode) {
      err = new Error(data.errmsg);
      err.name = 'DingTalkAPIError';
      err.code = data.errcode;
      return callback(err, data);
    }
    callback(null, data);
  };
};