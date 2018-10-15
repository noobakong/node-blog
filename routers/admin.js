var express = require('express')
var router = express.Router()


var User = require('../models/user')
var Category = require('../models/categories')
var Content = require('../models/content')

router.use((req, res, next) => {
  // 如果当前用户非管理员
  if (!req.userInfo.isAdmin) {
    res.send('你是管理员吗？？？ 你不是哦~')
    return
  }
  next()
})

// 首页
router.get('/', (req, res, next) => {
  res.render('admin/index', {
    userInfo: req.userInfo
  })
})

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

    /* 
      1 -> 升序
      -1 -> 降序
      id: 生成的默认id有时间戳，越晚生成 id越大
      sort() 排序方法 传参 sort({_id: 1})
     */
    Category.find().sort({ _id: -1 }).limit(limit).skip(skip).then((categories) => {
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

/* 
内容首页
 */
router.get('/content', (req, res) => {
  var page = Number(req.query.page || 1)
  var pages = 0
  var limit = 10

  Content.count().then((count) => {
    // 计算总页数
    pages = Math.ceil(count / limit)
    // 取值不能超过 pages
    page = Math.min(page, pages)
    // 取值不能小于1
    page = Math.max(page, 1)
    var skip = (page - 1) * limit

    /* 
      1 -> 升序
      -1 -> 降序
      id: 生成的默认id有时间戳，越晚生成 id越大
      sort() 排序方法 传参 sort({_id: 1})
     */
    Content.find().sort({ addTime: -1 }).limit(limit).skip(skip).populate(['category', 'user']).then((contents) => {
      res.render('admin/content_index', {
        userInfo: req.userInfo,
        contents: contents,
        page: page,
        pages: pages,
        count: count,
        limit: limit
      })
    })
  })
})

/* 
内容添加
 */
router.get('/content/add', (req, res) => {
  Category.find().sort({_id: -1}).then((categories) => {
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories: categories
    })
  })
})


/*
内容保存 
 */

 router.post('/content/add', (req, res) => {
   // 简单验证
   if (req.body.category == '') {
     res.render('admin/error', {
       userInfo: userInfo,
       message: '分类内容不能为空'
     })
     return
   }
   if (req.body.title == '') {
     res.render('admin/error', {
       userInfo: userInfo,
       message: '标题内容不能为空'
     })
     return
   }

   // 保存内容到数据库
   new Content({
     category: req.body.category,
     title: req.body.title,
     user: req.userInfo._id.toString(),
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

module.exports = router