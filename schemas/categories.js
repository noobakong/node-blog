var mongoose = require('mongoose')

// 分类结构
module.exports = new mongoose.Schema({
  name: {
    type: String
  }
})