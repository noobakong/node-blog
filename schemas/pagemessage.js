var mongoose = require('mongoose')

// 用户表结构
module.exports = new mongoose.Schema({
  visiter: {
    type: String,
    default: 0
  }
})