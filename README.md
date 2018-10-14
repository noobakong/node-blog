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

#### 区分管理员 

给userInfo 添加 isAdmin 属性

使用swig 选择渲染

### 后台管理

#### bootstrap 模板建立页面

#### 使用继承模板

公用的继承

```html
{% extends 'layout.html' %}
```



特殊的重写 

```html
{% block main %}
  <div class="jumbotron">
    <h1>Hello, {{userInfo.username}}!</h1>
    <p>欢迎进入后台管理</p>
  </div>
{% endblock%}
```

#### admin 首页

```javascript
// 首页
router.get('/', (req, res, next) => {
  res.render('admin/index', {
    userInfo: req.userInfo
  })
})
```

#### admin/user 用户管理

- 建立静态 user_index.html

- 处理路由

- 读取数据库中所有用户数据

- 页面展示 --table表格

- 分页

  - 数据里 limit

  - skip()

  - 分页原理

    ```javascript
      /*
      从数据库中读取所有的用户数据
       limit(number) 限制获取的数据条数
       skip(number) 忽略数据的条数
        每页显示 5 条
        第一页： 1-5  skip：0  -> (当前页 1 - 1) * 每页的条数
        第二页： 6-10 skip：5  -> (当前页 2 - 1) * 每页的条数
        ...
        ...
       */
      var page = req.query.page || 1
      var limit = 5
      var skip = (page - 1) * limit
      User.find().limit(limit).skip(skip).then((users) => {
        res.render('admin/user_index', {
          userInfo: req.userInfo,
          users: users
        })
      })
    ```

  - 客户端实现

    ```html
      <nav aria-label="...">
        <ul class="pager">
          <li class="previous"><a href="/admin/user?page={{page-1}}"><span aria-hidden="true">&larr;</span>上一页</a></li>
          <li>
            一共有 {{count}} 条数据 || 每页显示 {{limit}} 条数据 || 一共 {{pages}} 页 || 当前第 {{page}} 页
          </li>
          <li class="next"><a href="/admin/user?page={{page+1}}">下一页<span aria-hidden="true">&rarr;</span></a></li>
        </ul>
      </nav>
    ```

  - 服务端代码

    ```javascript
    /*
      从数据库中读取所有的用户数据
       limit(number) 限制获取的数据条数
       skip(number) 忽略数据的条数
        每页显示 5 条
        第一页： 1-5  skip：0  -> (当前页 1 - 1) * 每页的条数
        第二页： 6-10 skip：5  -> (当前页 2 - 1) * 每页的条数
        ...
        ...
        User.count() 查询总数据量
       */
      
      var page = Number(req.query.page || 1)
      var pages = 0
      var limit = 5

      User.count().then((count) => {
        // 计算总页数
        pages = Math.ceil(count / limit)
        // 取值不能超过 pages
        page = Math.min(page, pages)
        // 取值不能小于1
        page = Math.max(page, 1)
        var skip = (page - 1) * limit

        User.find().limit(limit).skip(skip).then((users) => {
          res.render('admin/user_index', {
            userInfo: req.userInfo,
            users: users,
            page: page,
            pages: pages,
            count: count,
            limit: limit
          })
        })
      })
    ```

  - 抽取page 使用 include 语法以后复用  

#### 分类首页

category_index.html

#### 添加分类

category_add.html

- get 渲染页面

- post 提交页面

  - 设计表结构
    schemas/categories.js
    models/categories.js

- 相关代码

  ```javascript
  /*
  添加分类页面 
   */
  router.get('/category/add', (req, res) => {
    res.render('admin/category_add', {
      userInfo: req.userInfo
    })
  })

  /*
  添加分类的保存
   */
  router.post('/category/add', (req, res) => {
    var name = req.body.name || ''
    if (name == '') {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '名称不能为空'
      })
      return
    }

    // 是否已有分类
    Category.findOne({
      name: name
    }).then((result) => {
      if (result) {
        // 数据库中已经存在
        res.render('admin/error', {
          userInfo: req.userInfo,
          message: '分类已经存在'
        })
        return Promise.reject()
      } else {
        // 数据库中不存在分类
        return new Category({
          name: name
        }).save()
      }
    }).then((newCategory) => {
      res.render('admin/success', {
        userInfo: req.userInfo,
        message: '分类保存成功',
        url: '/admin/category'
      })
    })
  })
  ```

  通过判断 渲染 error 或者 success 的页面 两个页面都在 `admin/error.html` 和 `admin/success.html` 中