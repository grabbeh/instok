var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   

var userSchema = new Schema({
    _id: String,
    email: String,
    username: String,
    hash: String,
    items: [{ type: Schema.Types.ObjectId, ref: 'Thing' }],

});

module.exports = mongoose.model('User', userSchema);