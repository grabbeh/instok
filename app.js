
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
, template = require('./routes/template')
, login = require('connect-ensure-login')
, https = require('https')
, http = require('http')
, fs = require('fs')

mongoose.connect('mongodb://' + db.details.user + ':' + db.details.pass + '@' + db.details.host + ':' + db.details.port + '/' + db.details.name );

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
    process.nextTick(function () {
      User.findOne({_id: username}, function(err, user) {
       if (!user) { 
          return done(null, false); 
      }
      bcrypt.compare(password, user.hash, function(err, res){
         if (res){ return done(null, user)}
         else return done(null, false)
            })
        })
    })
  }
));

app.configure(function(){
  app.enable('trust proxy')
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

// Routes

app.get('/', function(req, res){
  res.render('index.html')
});

app.get('/alerts', route.getAlerts);

app.get('/sentalerts', route.getSentAlerts);

app.get('/alerts/:id', route.getAlert);

app.post('/alerts/:id', route.postAlert);

app.delete('/alerts/:id', route.deleteAlert);

app.put('/alerts/:id', route.editAlert);

app.post('/sendalert/:id', route.sendAlert);

// Templates

app.post('/templates', template.addTemplate);

app.get('/templates', template.getTemplates);

app.put('/templates/:id', template.editTemplate);

app.delete('/templates/:id', template.deleteTemplate);

app.get('/templates/:id', template.getTemplate);

// Authentication

app.post('/signup', user.createaccount);

app.post('/login', 
  passport.authenticate('local'), 
    function(req, res){
      if (req.user){
      res.redirect('/#/account');
    }
    else { res.redirect('/#/login')}
  })

app.get('/logout', user.logout);

app.put('/user', user.updateaccount);

app.get('/currentuser', function(req, res){
  if (req.user) {
      res.json(req.user);
  }
  else {
    res.status(401);
    res.send();
  }
})
/*
var options = {
  key: fs.readFileSync('./config/domain.pem'),
  cert: fs.readFileSync('./config/main.pem'),
  ca: [fs.readFileSync('./config/intermediate.pem')]
};*/

// Create an HTTP service.
http.createServer(app).listen(5000);
// Create an HTTPS service identical to the HTTP service.
//https.createServer(options, app).listen(5001);

