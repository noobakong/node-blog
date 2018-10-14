var express = require('express')
var router = express.Router()

var User = require('../models/user')
var Category = require('../models/categories')

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
      } else {
        // 要修改的分类名称是否已经在数据库中
        
      }
    }
  })
})

 /* 
 分类删除
 */
module.exports = router