var mongoose = require('mongoose')
var contentSchema = require('../schemas/content')

module.exports = mongoose.model('Content', contentSchema)