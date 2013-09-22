
var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var thingSchema = new Schema({
    thing: ObjectId,
    id: String,
    name: String
});

module.exports = mongoose.model('Thing', thingSchema);

