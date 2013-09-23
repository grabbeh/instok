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
        id: req.params.id
    }).save(function(err, alert){
        User.findOne({_id: req.user._id}, function(err, user){
            user.update({$addToSet: {alerts: alert._id}}, {upsert: true}, function(err) {
            })
        })
    });
};

exports.editAlert = function (req, res) {
    Alert.findOne({
        id: req.params.id
    }, function (err, alert) {
        alert.update({$addToSet: {key: value}}, {upsert: true}, function(err){
        })
    })
}

exports.deleteAlert = function (req, res) {
    Alert.findOne({ id: req.params.id }, function (err, alert) {
            User.update({_id: req.user._id}, {$pull: {alerts: alert._id}}, function(err, user){
                alert.remove(); 
        })
    })
};

exports.sendAlert = function(req, res){
    Alert.findOne({id: req.params.id}, function(err, alert){      
        twilio.sendSms({
            to: alert.number, 
            from: '+442033221672', 
            body: 'Hello there, ' + alert.item + ' is now available at ' + alert.location + ". Feel free to stop by!"
            }, function(err, responseData) { 
                if (err) {console.log(err)}
                console.log(responseData.body); 
                User.update({_id: req.user._id}, {$pull: {alerts: alert._id}}, function(err, user){
                alert.remove(); 
            })
        });
    })
}