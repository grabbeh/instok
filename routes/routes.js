var Alert = require('../models/alert.js');

exports.getAlerts = function (req, res) {
    Alert.find({}, function (err, alerts) {
        if (!err) {
            res.json(alerts);
        }
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
    console.log(req.body);
    var name = req.body.name;
    new Alert({
        item: req.body.item,
        location: req.body.location,
        number: req.body.number,
        id: req.params.id
    }).save(function (err, alert) {
        if (err) {console.log(err)}
        else {
            var data = {};
            data['message'] = "Alert saved - thank you";
            res.json(data);
        }
    });
};

exports.editAlert = function (req, res) {
    Alert.findOne({
        id: req.params.id
    }, function (err, alert) {
        alert.name = req.body.name,
        alert.save(function (err) {

            if (!err) {
                var data = {};
                data['message'] = "Alert edited - thank you";
                res.json(data);

            }
        })
    })
}

exports.deleteAlert = function (req, res) {
    Alert.findOne({
        id: req.params.id
    }, function (err, alert) {
        if (err) {
            console.log(err)
        }
        alert.remove();
    })
};