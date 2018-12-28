##  Node-Blog

> 后端使用node写的一个一整套的博客系统

 #### 主要功能

 - 登录
 - 注册
 - 发表文章
 - 编辑/删除文章
 - 添加/删除/编辑文章分类
 - 账号的管理
 - 评论功能
 - ...

#### 所用技术

- node


- express
- swig渲染模板
- body-parser中间件
- cookies
- mongod(mongoose) 数据库
- html css js ajax等

#### 主要页面展示

- index

  ![首页](https://blog-1257919906.cos.ap-guangzhou.myqcloud.com/image/notes/Node-nodeblog-index.png)



- 详情页

  ![详情页](https://blog-1257919906.cos.ap-guangzhou.myqcloud.com/image/notes/Node-nodeblog-detail.png)

  ​


- 后台

  ![后台管理](https://blog-1257919906.cos.ap-guangzhou.myqcloud.com/image/notes/Node-nodeblog-admin.png)

### 一、项目初始化
#### 1.1 创建目录 

├─models  *存放数据库数据模型*
├─public   *存放静态资源*
├─routers  *路由文件*
├─schemas *数据库Schema表*
└─views *静态页面*

│  .gitignore *github仓库上传忽略文件*
│  app.js *主程序入口文件*
│  package-lock.json 
│  package.json
│  README.md

#### 1.2 装包

使用npm安装项目要使用的包

#### 1.3 创建基本app服务

```javascript
var express = require('express')
var mongoose = require('mongoose')

var app = express()

// 连接数据库
mongoose.connect('mongodb://localhost/node-blog', { useNewUrlParser: true });

app.listen(3000, function () {
  console.log('http://localhost:3000') 
})
```



### 二、开发开始
#### 2.1 模板使用 swig
```javascript
// 定义模板引擎
app.engine('html', swig.renderFile)
// 设置模板文件存放目录
app.set('views', './views')
// 注册模板引擎
app.set('view engine', 'html')

//设置swig页面不缓存
swig.setDefaults({
  allowErrors: false,
  autoescape: true,
  cache: false
})
```

#### 2.2 静态文件托管

```javascript
// 静态文件托管
app.use('/public', express.static(__dirname + '/public')
```

**知识点1：在 Express 中提供静态文件**

> 为了提供诸如图像、CSS 文件和 JavaScript 文件之类的静态文件，请使用 Express 中的 `express.static` 内置中间件函数。

```javascript
app.use(express.static('public'));
```

这样后 我们就可以访问public文件中的任意目录的任意文件：

```
http://localhost:3000/images/kitten.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/app.js
```

**注意：** Express 相对于静态目录查找文件，因此**静态目录的名称不是此 URL 的一部分**。

可以多次使用static函数开启多个静态资源入口。

**自定义文件目录名称**

上面的例子中我们可以访问 `http://localhost:3000/js/app.js`这个目录 但是如果我想通过`http://localhost:3000/static/js/app.js`来访问，我们可以使用：

```javascript
app.use('/static', express.static('public'));
```

来创建虚拟路径前缀（路径并不实际存在于文件系统中）

当然，在项目中一般使用绝对路径来保证代码的可行性：

``` javascript
app.use('/static', express.static(__dirname + '/public'));
```

#### 2.3 连接数据库

```javascript
// 连接数据库
mongoose.connect('mongodb://localhost/node-blog' { useNewUrlParser: true });
```

mongod会在第一个数据创建的时候新建我们的node-blog数据库，不需要我们手动创建

后面的一个配置项最好加上。不报错的话可不加。

#### 2.4 分模块开发与实现

##### 路由
- 前台模块 main模块
  * / 首页
  * / 内容页
- 后台管理模块 admin模块
- API模块 api模块

```javascript
// 路由
app.use('/admin', require('./routers/admin'))
app.use('/api', require('./routers/api'))
app.use('/', require('./routers/main'))
```

**知识点2：express.Router的使用**

> 使用 `express.Router` 类来创建可安装的模块化路由处理程序。`Router` 实例是完整的中间件和路由系统；因此，常常将其称为“微型应用程序”。

使用express.Router，可以将路由更加模块化

比如：在 routers文件夹下新建 main.js

```javascript
var express = require('express')
var router = express.Router()
...

router.get('/', function (req, res, next) {
    ...
}

router.get('/view',(req, res) => {
    ...
}
    
module.exports = router
```

> 末尾使用module.exports = router 将router对象暴露出去

我们将其安装在主应用程序app.js的路径中

```javascript
...
app.use('/', require('./routers/main'))
...
```

此时的  ‘/’ 路径请求的就是 main.js中的 ’/‘

/view --> main.js 中的 '/view'

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

### 三、注册 登录 登出
#### 3.1 userSchema创建

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

#### 3.2 创建User model

```javascript
var mongoose = require('mongoose')
var userSchema = require('../schemas/user')

module.exports = mongoose.model('User', userSchema)
```



**知识点3：mongoose中的 Schema 和 Model**

> Mongoose 的一切始于 Schema。每个 schema 都会映射到一个 MongoDB collection ，并定义这个collection里的文档的构成

[关于schema的官方文档](https://cn.mongoosedoc.top/docs/guide.html)

- 定义一个schema

  ```javascript
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var blogSchema = new Schema({
      title:  String,
      author: String,
      body:   String,
      comments: [{ body: String, date: Date }],
      date: { type: Date, default: Date.now },
      hidden: Boolean,
      meta: {
        votes: Number,
        favs:  Number
      }
    });
  ```

- 创建一个model

  > 我们要把 schema 转换为一个 [Model](https://cn.mongoosedoc.top/docs/models.html)， 使用 `mongoose.model(modelName, schema)` 函数：

  ```javascript
    var Blog = mongoose.model('Blog', blogSchema);
  ```

  [Models](https://cn.mongoosedoc.top/docs/api.html#model-js) 是从 `Schema` 编译来的构造函数。 它们的实例就代表着可以从数据库保存和读取的 [documents](https://cn.mongoosedoc.top/docs/documents.html)。 从数据库创建和读取 document 的所有操作都是通过 model 进行的。

  第一个参数是跟 model 对应的集合（ collection ）名字的 *单数* 形式。 **Mongoose 会自动找到名称是 model 名字 复数形式的 collection** 。 对于上例，Blog这个 model 就对应数据库中 **blogs** 这个 collection。`.model()` 这个函数是对 `schema` 做了拷贝（生成了 model）。 

  >  你要确保在调用 `.model()` 之前把所有需要的东西都加进 `schema` 里了

  一个model就是创造了一个mongoose实例，我们才能将其操控。

  *我的片面理解把Schema和model的关系 想成 构造函数和实例之间的关系*

#### 3.3 注册

注册逻辑

- 表单验证
- 数据库验证
- 前台 ajax

1. **静态页面**

2. **处理 前端ajax注册**

   ```javascript
       // 注册
       $register.find('.user_register_btn').on('click', function () {
           $.ajax({
               type: 'post',
               url: 'api/user/register',
               data: {
                   username: $register.find('[name="username"]').val(),
                   password: $register.find('[name="password"]').val(),
                   repassword: $register.find('[name="repassword"]').val()
               },
               dataType: 'json',
               success: function (result) {
                   $register.find('.user_err').html(result.message)

                   if (!result.code) {
                       setTimeout(() => {
                           $('.j_userTab span')[0].click()
                       }, 1000)
                   }
               }
           })
       })
   ```

3. **后台api路由**

   >  在api.js中编写后台注册相关代码

   ```javascript
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
   ```

   后台通过简单的验证，将结果通过 `res.json` 的方式来返还给 前台 ajax 再通过json信息来处理页面展示。

   ​

   **知识点4：使用`body-parser`中间件来处理post请求**

   > [关于express的更多中间件](https://expressjs.com/zh-cn/resources/middleware.html)

   使用案例

   ```javascript
   var express = require('express')
   var bodyParser = require('body-parser')

   var app = express()

   // parse application/x-www-form-urlencoded
   app.use(bodyParser.urlencoded({ extended: false }))

   // parse application/json
   app.use(bodyParser.json())
   ```

   通过以上的配置，我们就可以获取通过 req.body 来获取 post 请求总的参数了

   ```javascript
   ...
     var username = req.body.username
     var password = req.body.password
     var repassword = req.body.repassword
   ...
   ```

   **知识点5: mongoose中数据库的操作**

   前段时间总结过一些mongoose的增删查操作笔记：

   ​	[node中的mongodb和mongoose](https://noobakong.gitee.io/2018/10/06/node%E4%B8%AD%E7%9A%84mongodb%E5%92%8Cmongoose/)

   ​

 #### 3.4 登录

1. **前台ajax**

   ```javascript
   // 登录
       $login.find('.user_login_btn').on('click', function () {
           $.ajax({
               type: 'post',
               url: 'api/user/login',
               data: {
                   username: $login.find('[name="username"]').val(),
                   password: $login.find('[name="password"]').val(),
               },
               dataType: 'json',
               success: function (result) {
                   $login.find('.user_err').html(result.message)
                   // 登录成功
                   if (!result.code) {
                       window.location.reload()
                   }
               }
           })
       })
   ```

2. **后台路由处理及数据库查询**

   ```javascript
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
   ```

#### 3.5 cookies

> 上面的案例中，为了记录我们的登录状态，我们使用了第三发包 -- cookies 来存储登录信息

1. **app 引入 cookies模块**

   ```javascript
   var Cookies = require('cookies')
   ```

2. **在 api.js 中获取 cookies**

   ```javascript
   req.cookies.set('userInfo', JSON.stringify({
         _id: userInfo._id,
         username: escape(userInfo.username)
       }))
   ```

   ​

3. **在 app.js 中解析登录用户的cookies**  

   ```javascript
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
   }
   ```

4. **用 swig 渲染模板控制 index页面**

#### 3.6登出

ajax --》   api.js --> cookies设置为空 -> 刷新页面

登出的实现就比较简单，只需将cookies设置为空即可

1. **前台ajax**

   ```javascript
       // 登出
       $('#logout').on('click', function () {
           $.ajax({
               url: '/api/user/logout',
               success: function(result) {
                   if (!result.code) {
                       window.location.reload()
                   }
               }
           })
       })
   ```

2. **api路由**

   ```javascript
   // 退出登录
   router.get('/user/logout', (req, res) => {
     req.cookies.set('userInfo', null)
     res.json(responseData)
   })
   ```

#### 3.7 中文用户名登录异常

原因 cookies在存储中午时出现乱码
解决办法 将username进行转码再解码

使用    `encode` 和  `decode` 来进 编码和解码

#### 3.8 区分管理员 

给userInfo 添加 isAdmin 属性

使用swig 选择渲染

### 四、后台管理

#### 4.1 bootstrap 模板建立页面

#### 4.2 使用继承模板

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

admin 首页

```javascript
// 首页
router.get('/', (req, res, next) => {
  res.render('admin/index', {
    userInfo: req.userInfo
  })
})
```

#### 4.3 admin/user 用户管理

- 建立静态 user_index.html

- 处理路由及分页逻辑

  ```javascript
  // 用户管理
  router.get('/user', (req, res) => {

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
    var limit = 10

    User.count().then((count) => {
      // 计算总页数
      pages = Math.ceil(count / limit)
      // 取值不能超过 pages
      page = Math.min(page, pages)
      // 取值不能小于1
      page = Math.max(page, 1)
      var skip = (page - 1) * limit
  	
      // 读取数据库中所有用户数据
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
    
  })
  ```

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

#### 4.4 文章分类相关

1. **分类首页**

   category_index.html

2. 添加分类

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

3. **首页展示展示**

   > 同用户管理首页展示一样

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

4. **分类修改 删除**

   在渲染的分类首页的分类表格中加入

```html
      <td>
        <a href="/admin/category/edit?id={{category._id.toString()}}" class="btn btn btn-primary">修改</a>
        <a href="/admin/category/delete?id={{category._id.toString()}}" class="btn btn-danger">删除</a>
      </td>
```

通过query的传值分类的id 值 我们来操作id

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

#### 4.5 内容管理 -内容首页和内容添加

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

#### 4.6内容提交保存

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

#### 4.7 关于内容分类的表关联关系

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

**知识点6： mongoose中的表关联**

> Population 可以自动替换 document 中的指定字段，替换内容从其他 collection 获取。 我们可以填充（populate）单个或多个 document、单个或多个纯对象，甚至是 query 返回的一切对象

简单的说，A表的可以关联B表，通过调用A表的属性数据取到B表内容的值，就像sql的join的聚合操作一样。

```javascript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var personSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  age: Number,
  stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

var storySchema = Schema({
  author: { type: Schema.Types.ObjectId, ref: 'Person' },
  title: String,
  fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});

var Story = mongoose.model('Story', storySchema);
var Person = mongoose.model('Person', personSchema);
```

我们创建了Story 和 Person两个数据库实例。

`Person` model 的 `stories` 字段设为 `ObjectId`数组。 `ref` 选项告诉 Mongoose 在填充的时候使用哪个 model，本例中为 `Story` model。 

接下来我们使用 [Population](https://cn.mongoosedoc.top/docs/populate.html#population) 来填充使用

```javascript
Story.
  findOne({ title: 'Casino Royale' }).
  populate('author').
  exec(function (err, story) {
    if (err) return handleError(err);
    console.log('The author is %s', story.author.name);
    // prints "The author is Ian Fleming"
  });
```

更多高级用法： [Mongoose Populate](https://cn.mongoosedoc.top/docs/populate.html)



#### 4.8 内容修改

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

#### 4.9 内容保存

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

#### 4. 10内容删除

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



### 五、前台相关

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



#### 5.1 完善首页细节 改为后台传来的data显示

使用swig的渲染模板 完善页面信息，不在赘述

#### 5.2 设置分页

```html
{% if pages > 1 %}
<nav aria-label="..." id="pager_dh">
  <ul class="pager">
    {% if page <=1 %} <li class="previous"><span href="#"><span aria-hidden="true">&larr;</span>没有上一页了</span></li>
      {%else%}
      <li class="previous"><a href="/?category={{category}}&page={{page-1}}"><span aria-hidden="true">&larr;</span>上一页</a></li>
      {%endif%}
      <span class="page_text">{{page}} / {{pages}}</span>
      {% if page >=pages %}
      <li class="next"><span href="#">没有下一页了<span aria-hidden="true">&rarr;</span></li>
      {%else%}
      <li class="next"><a href="/?category={{category}}&page={{page+1}}">下一页<span aria-hidden="true">&rarr;</span></a></li>
      {%endif%}
  </ul>
</nav>
{%endif%}
```

####5.3 content 创建时间的问题

我们创建addTime的时候，会发现mongod创建的数据的时间戳完全一样

我们不能使用`new date()`来创建默认时间 使用 `Date.now`



#### 5.4 处理分类点击跳转

```javascript
  var where = {}
  if (data.category) {
    where.category = data.category
  }
```

 mongoose查询的时候使用 `where` 查询



#### 5.5 分类高亮显示

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

#### 5.6 评论相关

**评论使用ajax来操作**

> 使用ajax操作不刷新页面来操作api

**后台api代码**

```javascript
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
```



**评论代码**

> ajax的操作都封装在了 routers/api.js 中

评论相关操作我们都放在了js/comments.js 中

```javascript
var limit = 4
var page = 1
var pages = 0
var comments = []

// 加载所有评论
$.ajax({
  type: 'get',
  url: 'api/comment/post',
  data: {
    contentid: $('#contentId').val(),
  },
  success: ((responseData) => {
    comments = responseData.data
    renderComment()
  })
})

$('.pager').delegate('a', 'click', function() {
  if ($(this).parent().hasClass('previous')) {
    page--
  } else {
    page++
  }
  renderComment()
})


// 提交评论
$('#commentBtn').on('click',function() {
  $.ajax({
    type: 'post',
    url: 'api/comment/post',
    data: {
      contentid: $('#contentId').val(),
      content: $('#commentContent').val()
    },
    success: ((responseData) => {
      $('#commentContent').val('')
      comments = responseData.data.comments
      renderComment(true)
    })
  })
})

function renderComment (toLaster) {
  $('#discuss_count').html(comments.length)

  var $lis = $('.pager li')
  pages = Math.ceil(comments.length / limit)
  if (!toLaster) {
    var start = (page-1) * limit
  } else {
    var start = (pages - 1) * limit
    page = pages
  }
  var end = (start + limit) > comments.length ? comments.length : (start + limit)
  if (pages <= 1) {
    $('.pager').hide()
  } else {
    $('.pager').show()
    $lis.eq(1).html(page + '/' + pages )
  
    if (page <= 1) {
      page = 1
      $lis.eq(0).html('<span>已是最前一页</span>')
    } else {
      $lis.eq(0).html('<a href="javacript:void(0);">上一页</a>')
    }
  
    if (page >= pages) {
      page = pages
      $lis.eq(2).html('<span>已是最后一页</span>')
    } else {
      $lis.eq(2).html('<a href="javacript:void(0);">下一页</a>')
    }
  }


  var html = ''
  if (comments.length) {
    for (var i = start; i < end; i++) {
      html += `
        <li>
            <p class="discuss_user"><span>${comments[i].username}</span><i>发表于 ${formatDate(comments[i].postTime)}</i></p>
            <div class="discuss_userMain">
                ${comments[i].content}
            </div>
        </li>
      `
    }
  }

  $('.discuss_list').html(html)
}

function formatDate(d) {
  var date1 = new Date(d)
  return date1.getFullYear() + '年' + (date1.getMonth()+1) + '月' + date1.getDate() + '日' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds()
}
```

### 六、总结

项目这个阶段知识简单能跑痛而已，包括细节的优化，和程序的安全性都没有考虑，安全防范措施为零，这也是以后要学习的地方。

第一次使用node写后台，完成了一次前后端的完整交互，最终要的还是做后台的一种思想，一种处理前后台关系的逻辑。

收获了很多，越来越感觉自己要学的东西太多了，自己好菜。。 

写总结文档有点累唉   _(°:з」∠)_秃头。