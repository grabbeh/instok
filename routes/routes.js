var Alert = require('../models/alert.js');
var User = require('../models/user.js');
var twilioauth = require('../config/twilio.js')
var twilio = require('twilio')(twilioauth.sid, twilioauth.token);

exports.getAlerts = function (req, res) {
    User.findOne({_id: req.session.user._id})
        .select('alerts')
        .populate('alerts')
        .exec(function(err, user){
            res.json(user.alerts)
    })
}

exports.getSentAlerts = function(req, res){
    User.findOne({_id: req.session.user._id})
        .select('sentalerts')
        .populate('sentalerts')
        .exec(function(err, user){
            res.json(user.sentalerts)
    })
}

exports.getAlert = function (req, res) {
    Alert.findOne({id: req.params.id})
        .populate('template')
        .exec(function (err, alert) {
            res.json(alert);
        })
    };

exports.postAlert = function (req, res) {

    new Alert({
        user: req.session.user._id,
        item: req.body.item,
        location: req.body.location,
        number: req.body.number,
        id: req.params.id,
        content: req.body.content
    }).save(function(err, alert){
        User.findOne({_id: req.session.user._id})
            .update({$addToSet: {alerts: alert._id}})
            .exec(function(){
                res.status(200);
                res.send({message: "Alert added"});
            })          
        })
    };

exports.editAlert = function (req, res) {
    Alert.update({id: req.params.id}, { 
        location: req.body.location, 
        number: req.body.number,
        item: req.body.item,
        content: req.body.content
    }, function(err, user){
            res.status(200);
            res.send({message: "Alert updated"});         
    })
}

exports.deleteAlert = function (req, res) {
    Alert.findOne({ id: req.params.id }, function (err, alert) {
        User.findOne({_id: req.session.user._id}) 
            .update({$addToSet: {abortedalerts: alert._id}})
            .update({$pull: {alerts: alert._id}})
            .exec(function(){
                res.status(200);
                res.send();
            });               
        })
    };

exports.sendAlert = function(req, res){
   
    Alert.findOne({id: req.params.id})
        .populate('template')
        .exec(function(err, alert){ 
            var body = replaceStringsWithValues(alert.content, alert);
            twilio.sendSms({
                to: alert.number, 
                // test
                from: '+442033221672', 
                body: body
                }, function (err, message) { 

                        if (err) { res.send("Alert failed to send") }

                        else { 
                        
                        res.json({message: "Alert sent", creditsremaining: req.body.creditsremaining});
                        User.findOne({_id: req.session.user._id})
                            .update({$addToSet: {sentalerts: alert._id}})
                            .update({$pull: {alerts: alert._id}})
                            .update({credits: req.body.creditsremaining})
                            .exec()
                            }
                        })
                    })
                }

function replaceStringsWithValues(str, object) {
    return str.replace("{ item }", object.item).replace("{ location }", object.location);
}