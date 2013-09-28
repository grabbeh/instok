var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   

var userSchema = new Schema({
    _id: String,
    email: String,
    pword: String,
    username: String,
    location: String,
    hash: String,
    alerts: [{ type: Schema.Types.ObjectId, ref: 'Alert' }],

});

module.exports = mongoose.model('User', userSchema);