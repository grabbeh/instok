var Thing = require('../models/thing.js');

exports.getThings = function (req, res) {
    Thing.find({}, function (err, things) {
        if (!err) {
            res.json(things);
        }
    })
}

exports.getThing = function (req, res) {
    Thing.findOne({
        id: req.params.id
    }, function (err, thing) {
        if (!err) {
            res.json(thing);
        }
    })
};

exports.postThing = function (req, res) {
    console.log(req.body);
    var name = req.body.name;
    new Thing({
        name: name,
        id: req.params.id
    }).save(function (err, thing) {
        if (!err) {
            var data = {};
            data['message'] = "Thing saved - thank you";
            res.json(data);
        }
    });
};

exports.editThing = function (req, res) {
    Thing.findOne({
        id: req.params.id
    }, function (err, thing) {
        thing.name = req.body.name,
        thing.save(function (err) {

            if (!err) {
                var data = {};
                data['message'] = "Thing edited - thank you";
                res.json(data);

            }
        })
    })
}

exports.deleteThing = function (req, res) {
    Thing.findOne({
        id: req.params.id
    }, function (err, thing) {
        if (err) {
            console.log(err)
        }
        thing.remove();
    })
};