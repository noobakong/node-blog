var express = require('express')
var router = express.Router()
var User = require('../models/user')


// 统一返回格式
var responseData;

router.use(function (req, res, next) {
  responseData = {
    code: 0,
    message: ''
  }
  next()
})

/* 
注册：
  注册逻辑
  1. 用户名不能为空
  2. 密码不能为空
  3. 两次密码一致

  数据库查询
  1. 用户名是否已经被注册
*/
router.post('/user/register', function (req, res, next) {
  var username = req.body.username
  var password = req.body.password
  var repassword = req.body.repassword

// -------表单简单验证-----------
  if (username == '') {
    responseData.code = 1
    responseData.message = '用户名不能为空'
    res.json(responseData)
    return
  }
  if (password == '') {
    responseData.code = 2
    responseData.message = '密码不能为空'
    res.json(responseData)
    return
  }
  if (password !== repassword ) {
    responseData.code = 3
    responseData.message = '两次密码不一致啊'
    res.json(responseData)
    return
  }
// -------------------------------

// -------数据库验证验证-----------
  User.findOne({
    username: username
  }).then((userInfo) => {
    if (userInfo) {
      // 数据库中已有用户
      responseData.code = 4
      responseData.message = '用户名有了，去换一个'
      res.json(responseData)
      return
    }
    // 保存用户注册信息
    var user = new User({
      username: username,
      password: password
    })
    return user.save()
  }).then((newUserInfo) => {
    console.log(newUserInfo)
    responseData.message = '注册成功'
    res.json(responseData)
  })
// -------------------------------

})


module.exports = router