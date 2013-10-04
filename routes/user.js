// imports data models for use in post functions below

var User = require('../models/user.js');
var bcrypt = require("bcrypt");

// passport introduction

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
};

exports.updateaccount = function(req, res){
  console.log(req.body.location);
   User.findOneAndUpdate({_id: req.user._id}, {location: req.body.location}, function(err){
    if (err) { console.log(err) }
      
   })
}

exports.createaccount = function(req, res) {

var newuser = req.body.username;
var newpw = req.body.password;
if (newuser.length < 2 || newpw.length < 7 ) {
  res.send("Username must be 2 or more characters and passwords must be 6 or more characters in length")
}
else {
User.findOne({username: newuser.toUpperCase()}, function(err, user) {
    if (user) {
        res.send('Username already taken - please choose another one')
            }
    else  {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                new User({_id: req.body.username,
                    location: req.body.location,
                    username: req.body.username.toUpperCase(),
                    hash: hash,
                    alerts: [],
                    sentalerts: [],
                    abortedalerts: [],
                    templates: []
                    }).save(function(err) {
                        res.redirect("/");
                    })
               });
            });
        }
    })
  }
}

