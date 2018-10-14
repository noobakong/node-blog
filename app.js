// 启动入口文件
var express = require('express')
var swig = require('swig')
var app = express()
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var Cookies = require('cookies')

var User = require('./models/user')
//设置swig页面不缓存
swig.setDefaults({
  cache: false
})

// 配置bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

// 设置cookies
app.use((req, res, next) => {
  req.cookies = new Cookies(req, res)

  // 解析登录用户的cookies
  req.userInfo = {}
  if (req.cookies.get('userInfo')) {
    try {
      req.userInfo = JSON.parse(req.cookies.get('userInfo'))

      // 获取用户是否是管理员
      User.findById(req.userInfo._id).then((userInfo) => {
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin)
        next()
      })
    } catch (e) {
      next()
    }
  } else {
    next()
  }
})

// 静态文件托管
app.use('/public', express.static(__dirname + '/public'))

// 定义模板引擎
app.engine('html', swig.renderFile)
// 设置模板文件存放目录
app.set('views', './views')
// 注册模板引擎
app.set('view engine', 'html')

// 路由
app.use('/admin', require('./routers/admin'))
app.use('/api', require('./routers/api'))
app.use('/', require('./routers/main'))

// 连接数据库
mongoose.connect('mongodb://localhost/node-blog', { useNewUrlParser: true });

app.listen(3000, function () {
  console.log('http://localhost:3000') 
})