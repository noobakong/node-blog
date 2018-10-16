##  node-blog

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

#### 分类首页展示

​	同用户管理首页展示一样

```javascript
/*
分类首页 
 */
router.get('/category', (req, res) => {
  var page = Number(req.query.page || 1)
  var pages = 0
  var limit = 10

  Category.count().then((count) => {
    // 计算总页数
    pages = Math.ceil(count / limit)
    // 取值不能超过 pages
    page = Math.min(page, pages)
    // 取值不能小于1
    page = Math.max(page, 1)
    var skip = (page - 1) * limit

    Category.find().limit(limit).skip(skip).then((categories) => {
      res.render('admin/category_index', {
        userInfo: req.userInfo,
        categories: categories,
        page: page,
        pages: pages,
        count: count,
        limit: limit
      })
    })
  })
})

```

#### 分类修改 删除

在渲染的分类首页的分类表格中

```html
      <td>
        <a href="/admin/category/edit?id={{category._id.toString()}}" class="btn btn btn-primary">修改</a>
        <a href="/admin/category/delete?id={{category._id.toString()}}" class="btn btn-danger">删除</a>
      </td>
```

同过query的传值分类的id 值 我们来操作id

- 修改

  get

  ```javascript
  /* 
   分类修改 get
   */
  router.get('/category/edit', (req, res) => {
    // 获取要修改的分类信息 表单形式展现出来
    
    var id = req.query.id || ''
    // 获取修改的分类信息
    Category.findById(id).then((category) => {
      if (!category) {
        res.render('admin/error', {
          userInfo: req.userInfo,
          message: '分类信息不存在'
        })
        return Promise.reject()
      } else {
        res.render('admin/category_edit', {
          userInfo: req.userInfo,
          category: category
        })
      }
    })
  })
  ```

  post

  ```javascript
  /* 
   分类修改 post
   */
  router.post('/category/edit', (req, res) => {
    var id = req.query.id || ''
    var name = req.body.name || ''

    Category.findById(id).then((category) => {
      if (!category) {
        res.render('admin/error', {
          userInfo: req.userInfo,
          message: '分类信息不存在'
        })
        return Promise.reject()
      } else {
        // 当前用户没有做任何修改而提交
        if (name == category.name) {
          res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'
          })
          return Promise.reject()
        } else {
          // 要修改的分类名称是否已经在数据库中
          return Category.findOne({
            // id 不等于当前的id
            _id: {$ne: id},
            name: name
          })
        }
      }
    }).then((sameCategory) => {
      if (sameCategory) {
        res.render('admin/error', {
          userInfo: req.userInfo,
          message: '已存在同名分类'
        })
        return Promise.reject()
      } else {
        return Category.findByIdAndUpdate(id, {
          name: name
        })
      }
    }).then(() => {
      res.render('admin/success', {
        userInfo: req.userInfo,
        message: '修改分类名称成功',
        url: '/admin/category'
      })
    })
  })
  ```

- 删除

  ```javascript
  /* 
   分类删除
   */
  router.get('/category/delete', (req, res) => {
    // 获取id
    var id = req.query.id || ''

    Category.remove({
      _id: id
    }).then(() => {
      res.render('admin/success', {
        userInfo: req.userInfo,
        message: '删除成功',
        url: '/admin/category'
      })
    })
  })
  ```

  ​

#### 前台分类与排序

#### 内容管理 -内容首页和内容添加

```javascript
/* 
内容首页
 */
router.get('/content', (req, res) => {
  res.render('admin/content_index', {
    userInfo: req.userInfo
  })
})

/* 
内容添加
 */
router.get('/content/add', (req, res) => {

  Category.find().sort({_id: -1}).then((categories) => {
    console.log(categories)
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories: categories
    })
  })
})
```

#### 内容提交保存

- 新建 schemas/content.js 和 models/content.js 建立content模型

- 处理路由

  post

  后台

  ```javascript
     // 保存内容到数据库
     new Content({
       category: req.body.category,
       title: req.body.title,
       description: req.body.description,
       content: req.body.content
     }).save().then((content) => {
       res.render('admin/success', {
         userInfo: req.userInfo,
         message: '内容保存成功',
         url: '/admin/content'
       })
     })
   })
  ```

####  内容管理首页

同分类首页一样 渲染

#### 关于内容分类的表关联关系

```javascript
module.exports = new mongoose.Schema({
  title: {
    type: String
  },

  // 引用 关联字段
  category: {
    type: mongoose.Schema.Types.ObjectId,
    //引用 另外一张表的模型
    ref: 'Category'
  },

  description: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  }
})
```

我们在 处理 content 的 category的时候 关联个 另外一个结构表

在渲染页面的时候用mongoose 中提供搞得  populate() 方法



#### 内容修改

```javascript
/*
 修改内容 
  */
router.get('/content/edit', (req, res) => {
  // 获取要修改的内容信息 表单形式展现出来

  var id = req.query.id || ''

  var categories = []
  // 获取分类信息
  Category.find().sort({ _id: -1 })
  .then((result) => {
    categories = result
    return Content.findById(id).populate('category')
  })
  .then((content) => {
    console.log(content)
    if (!content) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '指定内容不存在'
      })
      return Promise.reject()
    } else {
      res.render('admin/content_edit', {
        userInfo: req.userInfo,
        content: content,
        categories: categories
      })
    }
  })

```

#### 内容保存

```javascript
/*
   内容修改
   */
  router.post('/content/edit', function(req, res) {
    var id = req.query.id || ''
    
    if (req.body.title == '') {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '标题不能为空'
      })
      return
    }

    if (req.body.description == '' || req.body.content == '') {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '简介和内容不能为空'
      })
      return
    }

    Content.findByIdAndUpdate(id, {
      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      content: req.body.content
    }).then(() => {
      res.render('admin/success', {
        userInfo: req.userInfo,
        message: '内容保存成功',
        url: '/admin/content'
      })
    })

  })
  
})
```

#### 内容删除

```javascript
/* 
内容删除
*/
router.get('/content/delete', (req, res) => {
  // 获取id
  var id = req.query.id || ''

  Content.remove({
    _id: id
  }).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/content'
    })
  })
})
```

#### 添加一些文章 信息  -- 作者 创建时间 点击量

作者  -- 关联 user表 

创建时间 -- new Date() 

​	前台渲染

```html
<td>{{content.addTime|date('Y-m-d H:i:s', -8*60)}}</td>
```

点击量 --》 先默认为 0 



### 前台相关

> 有了后台的数据，我们接下来看前台的

修改 main.js

```javascript
/*
首页渲染 
 */
router.get('/', function (req, res, next) {
  req.userInfo.username = unescape(req.userInfo.username)

  var data = {
    userInfo: req.userInfo,
    categories: [],
    contents: [],
    count: 0,
    page : Number(req.query.page || 1),
    pages : 0,
    limit : 10
  }
  
  Category.find()
    .then((categories) => {
      data.categories = categories
      return Content.count()
  })
    .then((count) => {
      data.count = count
      // 计算总页数
      data.pages = Math.ceil(data.count / data.limit)
      // 取值不能超过 pages
      data.page = Math.min(data.page, data.pages)
      // 取值不能小于1
      data.page = Math.max(data.page, 1)
      var skip = (data.page - 1) * data.limit

      return Content
        .find()
        .sort({ addTime: -1 })
        .limit(data.limit)
        .skip(skip)
        .populate(['category', 'user'])
    })
    .then((contents) => {
      data.contents = contents
      console.log(data)
      res.render('main/index', data)
    })
})
```

#### 完善首页细节 改为后台传来的data显示



#### 设置分页



####content 创建时间的问题

我们创建addTime的时候，会发现mongod创建的数据的时间戳完全一样

我们不能使用`new date()`来创建默认时间 使用 `Date.now`



#### 处理分类点击跳转

 where 查询



#### 分类高亮显示

```html
      <nav class="head_nav">
        {% if category == ''%}
        <a href="/" id="inactive">首页</a>
        {%else%}
        <a href="/">首页</a>
        {%endif%}

        {% for cate in categories%}
          {% if category == cate.id%}
          <a href="/?category={{cate.id}}" id="inactive">{{cate.name}}</a>
          {%else%}
          <a href="/?category={{cate.id}}">{{cate.name}}</a>
          {%endif%}
        {% endfor %}
      </nav>
```



### 详情页

#### 整理页面



#### ajax提交评论

> ajax的操作都封装在了 routers/api.js 中