var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   

var userSchema = new Schema({
	
    _id: String,
    email: String,
    username: String,
    hash: String,

});

module.exports = mongoose.model('User', userSchema);