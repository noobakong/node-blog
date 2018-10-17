var express = require('express')
var router = express.Router()
var Category = require('../models/categories')
var Content = require('../models/content')
var Pagemessage = require('../models/pagemessage')

var data = {}
// 通用数据
router.use((req,res, next) => {
  data = {
    userInfo: req.userInfo,
    categories: []
  }
  //访问量
  Pagemessage.findById('5bc6f9853afec4413c4a87b2')
    .then((pagemessage) => {
      pagemessage.visiter++
      pagemessage.save()
      data.visiters = pagemessage.visiter
    })

  Category.find()
    .then((categories) => {
      data.categories = categories
      next()
    })
})


/*
首页渲染 
 */
router.get('/', function (req, res, next) {
  req.userInfo.username = unescape(req.userInfo.username)
  
  data.category= req.query.category || ''
  data.contents= []
  data.count= 0
  data.page = Number(req.query.page || 1)
  data.pages = 0
  data.limit = 5


  // 分类筛选条件
  var where = {}
  if (data.category) {
    where.category = data.category
  }


Content.where(where).count()
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
        .where(where)
        .find()
        .sort({ addTime: -1 })
        .limit(data.limit)
        .skip(skip)
        .populate(['category', 'user'])
    })
    .then((contents) => {
      data.contents = contents
      // console.log(data)
      res.render('main/index', data)
    })
})

// 详情
router.get('/view',(req, res) => {
  req.userInfo.username = unescape(req.userInfo.username)
  var contentid = req.query.contentid || ''
  Content.findById(contentid).populate('user')
    .then((content) => {
      data.content = content
      content.views++
      content.save()
      res.render('main/detail', data)
    })
})

module.exports = router