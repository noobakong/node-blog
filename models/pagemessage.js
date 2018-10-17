var mongoose = require('mongoose')
var pageMessageSchema = require('../schemas/pagemessage')

module.exports = mongoose.model('PageMessage', pageMessageSchema)