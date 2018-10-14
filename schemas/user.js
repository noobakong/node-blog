var mongoose = require('mongoose')

// 用户表结构
module.exports = new mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})