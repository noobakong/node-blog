// 启动入口文件
var express = require('express')
var swig = require('swig')
var app = express()
var mongoose = require('mongoose')
var bodyParser = require('body-parser')


//设置swig页面不缓存
swig.setDefaults({
  cache: false
})

// 配置bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

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