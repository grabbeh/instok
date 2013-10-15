// imports data models for use in post functions below

var User = require('../models/user.js');
var bcrypt = require("bcrypt");

// passport introduction

exports.updateaccount = function(req, res){
   User.findOneAndUpdate({_id: req.session.user._id}, {location: req.body.location}, function(err){
    if (!err) { 
        res.status(200);
        res.send({message: "Account updated"})
        }  
   })
}

exports.createaccount = function(req, res) {
  
User.findOne({username: req.body.username.toUpperCase()}, function(err, user) {

    if (user) {
        res.status(401)
        res.send({message: 'Apologies - username already taken'})
        }

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            new User({_id: req.body.username,
                location: req.body.location,
                username: req.body.username.toUpperCase(),
                hash: hash,
                credits: 10,
                alerts: [],
                sentalerts: [],
                abortedalerts: [],
                templates: []
                }).save(function(err, user) {
                      req.session.regenerate(function(){
                            req.session.user = user;
                            res.status(200);
                            res.send()

                        });
                      }
                );
            });
        })
    })
}

