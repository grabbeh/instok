var Alert = require('../models/alert.js');
var User = require('../models/user.js');
var twilioauth = require('../config/twilio.js')
var twilio = require('twilio')(twilioauth.sid, twilioauth.token);

exports.getAlerts = function (req, res) {
    User.findOne({_id: req.user._id})
        .select('alerts')
        .populate('alerts')
        .exec(function(err, user){
            res.json(user.alerts)
    })
}

exports.getSentAlerts = function(req, res){
    User.findOne({_id: req.user._id})
        .select('sentalerts')
        .populate('sentalerts')
        .exec(function(err, user){
            res.json(user.sentalerts)
    })
}

exports.getAlert = function (req, res) {
    Alert.findOne({
        id: req.params.id
    }, function (err, alert) {
        if (!err) {
            res.json(alert);
        }
    })
};

exports.postAlert = function (req, res) {
    new Alert({
        user: req.user._id,
        item: req.body.item,
        location: req.body.location,
        number: req.body.number,
        id: req.params.id,
        template: req.body.template
    }).save(function(err, alert){
        console.log(alert)
        User.findOne({_id: req.user._id})
            .update({$addToSet: {alerts: alert._id}})
            .exec()          
        })
    };

exports.editAlert = function (req, res) {
    Alert.update({id: req.params.id}, { 
        location: req.body.location, 
        number: req.body.number,
        item: req.body.item
    }, function(err, user){
          res.json("Alert updated");
    })
}

exports.deleteAlert = function (req, res) {
    Alert.findOne({ id: req.params.id }, function (err, alert) {
        User.findOne({_id: req.user._id}) 
            .update({$addToSet: {abortedalerts: alert._id}})
            .update({$pull: {alerts: alert._id}})
            .exec();               
        })
    };

exports.sendAlert = function(req, res){
    Alert.findOne({id: req.params.id})
        .populate('template')
        .exec(function(err, alert){ 
            var template = alert.template[0] 
            console.log(template) 
            var body = replaceStringsWithValues(template.content, alert);
            console.log(body)
            twilio.sendSms({
                to: '+447842768246',
                //to: alert.number, 
                // test
                from: '+442033221672', 
                body: body
                }, function (err, message) { 
                        User.findOne({_id: req.user._id})
                            .update({$addToSet: {sentalerts: alert._id}})
                            .update({$pull: {alerts: alert._id}})
                            .exec()
                        })
                    })
                }

function replaceStringsWithValues(str, object) {
    return str.replace("{ item }", object.item).replace("{ location }", object.location);
}