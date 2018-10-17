var express = require('express')
var router = express.Router()
var User = require('../models/user')
var Content = require('../models/content')

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
    responseData.message = '不填用户名啊你'
    res.json(responseData)
    return
  }
  if (password == '') {
    responseData.code = 2
    responseData.message = '密码不填？'
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
    responseData.message = '耶~ 注册成功'
    res.json(responseData)
  })
// -------------------------------

})

// 登录逻辑处理
router.post('/user/login', (req, res) => {
  var username = req.body.username
  var password = req.body.password
  if (username == '' || password == '') {
    responseData.code = 1
    responseData.message = '去填完再点登录'
    res.json(responseData)
    return
  }

// 查询数据库用户名密码同时存在
  User.findOne({
    username: username,
    password: password
  }).then((userInfo) => {
    if (!userInfo) {
      responseData.code = 2
      responseData.message = '用户名或密码错啦'
      res.json(responseData)
      return
    }
    // 正确 登录成功
    responseData.message = '耶~ 登录成功'
    responseData.userInfo = {
      _id: userInfo._id,
      username: userInfo.username
    }
    req.cookies.set('userInfo', JSON.stringify({
      _id: userInfo._id,
      username: escape(userInfo.username)
    }))
    res.json(responseData)
  })
})


// 退出登录
router.get('/user/logout', (req, res) => {
  req.cookies.set('userInfo', null)
  res.json(responseData)
})

/*
进入详情获取评论
 */
router.get('/comment/post', (req, res) => {
  var contentid = req.query.contentid
  Content.findById(contentid)
    .then((content) => {
      responseData.data = content.comments
      res.json(responseData)
    })
})

/*
评论提交 
 */
router.post('/comment/post', (req, res) => {
  var contentid = req.body.contentid
  var postData = {
    username: req.userInfo.username,
    postTime: Date.now(),
    content: req.body.content
  }

  // 查询文章内容信息
  Content.findById(contentid)
    .then((content) => {
      content.comments.push(postData)
      return content.save()
    })
    .then((newContent) => {
      responseData.message = '评论成功!'
      responseData.data = newContent
      res.json(responseData)
    })
})


module.exports = router