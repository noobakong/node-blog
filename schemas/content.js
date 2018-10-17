var mongoose = require('mongoose')

// 内容表结构
module.exports = new mongoose.Schema({
  title: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  addTime: {
    type: Date,
    default: Date.now
  },

  views: {
    type: Number,
    default: 0
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
    default: '',
  },


  // 评论
  comments: {
    type: Array,
    default: []
  }
})