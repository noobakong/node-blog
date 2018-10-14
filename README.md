## node-blog

### 初始化
#### 创建目录
#### 装包
#### 创建基本app服务

### 开发开始
#### 模板使用 swig
```javascript
// 定义模板引擎
app.engine('html', swig.renderFile)
// 设置模板文件存放目录
app.set('views', './views')
// 注册模板引擎
app.set('view engine', 'html')

// res.render(文件) 渲染模板文件
```

#### 静态文件托管

```javascript
// 静态文件托管
app.use('/public', express.static(__dirname + '/public'))
```

#### 连接数据库
```javascript
// 连接数据库
mongoose.connect('mongodb://localhost/node-blog');
```

#### 分模块开发与实现

##### 路由
- 前台模块 main模块
  * / 首页
  * / 内容页
- 后台管理模块 admin模块

- API模块 api模块

##### 开发顺序
功能模块开发顺序
- 用户
- 栏目
- 内容
- 评论

编码顺序
- Schema 定义存储结构
- 功能逻辑
- 页面展示

### 注册 登录 登出
#### userSchema
*新建并编写 schemas/user.js*
```javascript
var mongoose = require('mongoose')

// 用户表结构
module.exports = new mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  }
})
```

*模型创建*
新建并编写 models/user.js

#### 注册

静态页面

处理 前端ajax注册

后台api路由
  post请求解析 -- body-parser
  在app.js 内配置 body-parser

注册逻辑
 - 表单验证
 - 数据库验证
 - 前台 ajax

 #### 登录

 处理 前端ajax注册
 后台api路由

 注册逻辑
 - 表单验证
 - 数据库验证
 - 前台 ajax
      页面渲染

#### cookies
  app 引入 cookies模块
  在 api.js 中获取 cookies
  在 app.js 中解析登录用户的cookies
  用 swig 渲染模板控制 index页面

#### 登出

ajax --》   api.js --> cookies设置为空 -> 刷新页面

#### 中文用户名登录异常

原因 cookies在存储中午时出现乱码
解决办法 将username进行转码再解码
