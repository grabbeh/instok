var mongoose = require('mongoose')
   , Schema = mongoose.Schema
   , ObjectId = Schema.ObjectId;

var templateSchema = new Schema({
    template: ObjectId,
    content: String,
    id: String,
    title: String,
});

module.exports = mongoose.model('Template', templateSchema);