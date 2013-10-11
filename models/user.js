var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   

var userSchema = new Schema({
    _id: String,
    email: String,
    username: String,
    location: String,
    hash: String,
    credits: Number,
    templates: [{ type: Schema.Types.ObjectId, ref: 'Template' }],
    alerts: [{ type: Schema.Types.ObjectId, ref: 'Alert' }],
    sentalerts: [{ type: Schema.Types.ObjectId, ref: 'Alert' }],
    abortedalerts: [{ type: Schema.Types.ObjectId, ref: 'Alert' }]

});

module.exports = mongoose.model('User', userSchema);
