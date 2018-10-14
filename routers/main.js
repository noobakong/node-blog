var express = require('express')
var router = express.Router()

router.get('/', function (req, res, next) {
  
  req.userInfo.username = unescape(req.userInfo.username)

  res.render('main/index', {
    userInfo: req.userInfo
  })
})

module.exports = router