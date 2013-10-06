
var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var alertSchema = new Schema({
    alert: ObjectId,
    user: String,
    id: String,
    item: String,
    location: String,
    number: String,
    content: String
});

module.exports = mongoose.model('Alert', alertSchema);

