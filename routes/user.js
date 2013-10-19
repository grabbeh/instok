
var User = require('../models/user');
var bcrypt = require("bcrypt");
var winston = require("winston");

exports.signedIn = function(req, res){
  if (req.session.user){
    res.status(200).send()
  }
  else {
    res.status(401).send()
  }
}

exports.currentUser = function(req, res){
    if (req.session.user) {
     var userdetails = {
        _id: req.session.user._id,
        credits: req.session.user.credits,
        location: req.session.user.location
     }
      res.set('Cache-Control', 'no-cache, no-store');
      res.json(userdetails);
  }
  else {
    res.status(401).send();
  }
}

exports.logIn = function(req, res){
    
    //console.log(req.cookies);
    authenticate(req.body.username, req.body.password, function(err, user){

      if (user){
          req.session.regenerate(function(){
            req.session.user = user;
            //req.session.cookie.wang = true;
            //req.session.cookie.expires = false;
            //console.log("Cookie maxAge = " + req.session.cookie.maxAge);
            res.status(200).send();
          })
          //console.log(req.session);
      }
      else {
        res.status(401).send({message: "Error with username or password - please try again"})
      }
      
  });
}

exports.logOut = function(req, res){
    req.session.destroy(function(){
    res.status(200).send();
  });
}

exports.updateaccount = function(req, res){
   User.findOneAndUpdate({_id: req.session.user._id}, {location: req.body.location}, function(err){
        res.status(200).send({message: "Account updated"});
   })
}

exports.createaccount = function(req, res) {
  
User.findOne({username: req.body.username.toUpperCase()}, function(err, user) {

    if (user) { res.status(401).send({message: 'Apologies - username already taken'})}

    bcryptCreateHash(req, res, function(err,user){
        req.session.regenerate(function(){
          req.session.user = user;
          res.status(200);
          res.send()
            });
        });
    })
}

function bcryptCreateHash(req, res, fn){
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
                }).save(fn);
            });
        })
    }

function authenticate(name, pass, fn) {

   User.findOne({_id: name}, function(err, user) {
       if (!user) {  return fn(new Error("Cannot find user"))}; 

       bcrypt.compare(pass, user.hash, function(err, res){
         if (err) return fn(err);
         if (res){ return fn(null, user)}
         fn(new Error('Invalid password'));
        })
    })
 }



