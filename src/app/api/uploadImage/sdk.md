该 SDK 适用于 Node.js 0.4.7 及其以上版本，若您的服务端是一个基于 Node.js 编写的网络程序，使用此 SDK ，可以安全地将您的数据存储到七牛云上。
方便让您应用的终端用户进行高速上传和下载，同时也使您的服务端更加轻盈。

Node.js SDK 下载地址
Node.js SDK 源码地址
Node.js SDK 主要包含对七牛云API的包装，遵循qiniu sdkspec
涉及到以下几个方面：

服务端操作，生成上传授权(uptoken)，私有bucket下载URL(downloadUrl)，文件操作授权
客户端操作，上传文件(qiniu/io.js)
文件管理(qiniu/rs.js)
数据处理(qiniu/fop.js)
公共库(qiniu/rpc.js, qiniu/util.js)

安装
通过 npm 以 node 模块化的方式安装：

npm install qiniu
初始化

在使用SDK 前，您需要一对有效的 AccessKey 和 SecretKey 签名授权。

可以通过如下步骤获得：

开通七牛开发者帐号
登录七牛开发者平台，查看 Access Key 和 Secret Key
对于服务端而言，常规程序流程是：

qiniu.conf.ACCESS_KEY = '<Your Access Key>'
qiniu.conf.SECRET_KEY = '<Your Secret Key>'
服务端操作时请务必初始化这两个变量


文件上传

上传流程
为了尽可能地改善终端用户的上传体验，七牛云存储首创了客户端直传功能。更多信息请参阅业务流程。

上传代码：

var qiniu = require("qiniu");
//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = 'Access_Key';
qiniu.conf.SECRET_KEY = 'Secret_Key';
//要上传的空间
bucket = 'Bucket_Name';
//上传到七牛后保存的文件名
key = 'my-nodejs-logo.png';
//构建上传策略函数
function uptoken(bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
  return putPolicy.token();
}
//生成上传 Token
token = uptoken(bucket, key);
//要上传文件的本地路径
filePath = './ruby-logo.png'
//构造上传函数
function uploadFile(uptoken, key, localFile) {
  var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        console.log(ret.hash, ret.key, ret.persistentId);       
      } else {
        // 上传失败， 处理返回代码
        console.log(err);
      }
  });
}
//调用uploadFile上传
uploadFile(token, key, filePath);

上传&回调
var qiniu = require("qiniu");
//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = 'Access_Key';
qiniu.conf.SECRET_KEY = 'Secret_Key';
//要上传的空间
bucket = 'Bucket_Name';
//上传到七牛后保存的文件名
key = 'my-nodejs-logo.png';
//构建上传策略函数，设置回调的url以及需要回调给业务服务器的数据
function uptoken(bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
  putPolicy.callbackUrl = 'http://your.domain.com/callback';
  putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)';
  return putPolicy.token();
}
//生成上传 Token
token = uptoken(bucket, key);
//要上传文件的本地路径
filePath = './nodejs-logo.png'
//构造上传函数
function uploadFile(uptoken, key, localFile) {
  var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        console.log(ret.hash, ret.key, ret.persistentId);       
      } else {
        // 上传失败， 处理返回代码
        console.log(err);
      }
  });
}
//调用uploadFile上传
uploadFile(token, key, filePath);

