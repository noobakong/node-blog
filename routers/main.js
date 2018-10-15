var express = require('express')
var router = express.Router()
var Category = require('../models/categories')
var Content = require('../models/content')

/*
首页渲染 
 */
router.get('/', function (req, res, next) {
  req.userInfo.username = unescape(req.userInfo.username)

  var data = {
    userInfo: req.userInfo,
    category: req.query.category || '',
    categories: [],
    contents: [],
    count: 0,
    page : Number(req.query.page || 1),
    pages : 0,
    limit : 5
  }
  
  // 分类筛选条件
  var where = {}
  if (data.category) {
    where.category = data.category
  }

  Category.find()
    .then((categories) => {
      data.categories = categories
      return Content.where(where).count()
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
        .where(where)
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


module.exports = router