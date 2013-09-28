
var express = require('express')
, bcrypt = require("bcrypt")
, MongoStore = require("connect-mongo")(express)
, passport = require('passport')
, flash = require('connect-flash')
, LocalStrategy = require('passport-local').Strategy
, mongoose = require('mongoose')
, app = express()
, Alert = require('./models/alert.js')
, route = require('./routes/routes.js')
, User = require('./models/user.js')
, db = require('./config/db.js')
, user = require('./routes/user')
, login = require('connect-ensure-login')
, https = require('https')
, http = require('http')
, fs = require('fs')

mongoose.connect('mongodb://' + db.details.user + ':' + db.details.pass + '@' + db.details.host + ':' + db.details.port + '/' + db.details.name );

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/login')
}

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({_id: id}, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  
  function(username, password, done) {
    console.log("User supplied details " + username + " " + password)
    process.nextTick(function () {
      User.findOne({_id: username}, function(err, user) {

       if (!user) { 
          return done(null, false); 
          console.log("No user")
      }

      bcrypt.compare(password, user.hash, function(err, res){
         if (res){ return done(null, user)}
         else return done(null, false)
            })
        })
    })
  }
));



var options = {
  key: fs.readFileSync('./config/domain.pem'),
  cert: fs.readFileSync('./config/main.pem'),
  ca: [fs.readFileSync('./config/intermediate.pem')]
};

app.locals.user = false;

app.configure(function(){
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat'}));		
  app.use(flash());          
  app.use(passport.initialize());
  app.use(passport.session({ secret: 'keyboard cat', 
	store: new MongoStore({url: 'mongodb://' + db.details.user + ':' + db.details.pass + '@' + db.details.host + ':' + db.details.port + '/' + db.details.name
	})
	}));  
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);

});

// middleware
function removeUser(req, res, next) {
    app.locals.user = null;
    next();
}

// Routes

app.get('/', function(req, res){
  res.render('index.html')
});

app.get('/alerts', ensureAuthenticated, route.getAlerts);

app.get('/alerts/:id', ensureAuthenticated, route.getAlert);

app.post('/alerts/:id', ensureAuthenticated, route.postAlert);

app.delete('/alerts/:id', ensureAuthenticated, route.deleteAlert);

app.put('/alerts/:id', ensureAuthenticated, route.editAlert);

app.post('/sendalert/:id', ensureAuthenticated, route.sendAlert);

// Authentication

app.post('/signup', user.createaccount);

app.post('/login', 
  passport.authenticate('local'), 
    function(req, res){
      if (req.user){
      app.locals.user = JSON.stringify({ 
        _id: req.user._id,
        location: req.user.location
      });
      res.redirect('/#/account');
    }
    else (console.log("No user at callback stage"
  ))
})

app.get('/logout', removeUser, user.logout);

// Create an HTTP service.
http.createServer(app).listen(5000);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(5001);

