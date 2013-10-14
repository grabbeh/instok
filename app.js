
var express = require('express')
, bcrypt = require("bcrypt")
, flash = require('connect-flash')
, LocalStrategy = require('passport-local').Strategy
, mongoose = require('mongoose')
, app = express()
, Alert = require('./models/alert.js')
, route = require('./routes/routes.js')
, payment = require('./routes/payment.js')
, User = require('./models/user.js')
, db = require('./config/db.js')
, user = require('./routes/user')
, template = require('./routes/template')
, login = require('connect-ensure-login')
, https = require('https')
, http = require('http')
, fs = require('fs')

mongoose.connect('mongodb://' + db.details.user + ':' + db.details.pass + '@' + db.details.host + ':' + db.details.port + '/' + db.details.name );

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

app.configure(function(){
  app.enable('trust proxy')
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat'}));    
  app.use(flash());          
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
  app.use(errorHandler);

});

function errorHandler(err, req, res, next){
  res.send(err.stack)
}
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

// Stripe payment

app.post('/addcredit', payment.createCharge);

// Authentication

app.post('/signup', user.createaccount);

app.post('/login', function(req, res){
  
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
        req.session.regenerate(function(){
        req.session.user = user;
        res.status(200);
        res.send()
      });
    } 
    if (err) {
      res.status(401);
      res.send({message: "Error with username or password - please try again"})
    }
  });
});
  

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.put('/user', user.updateaccount);

app.get('/currentuser', function(req, res){
  if (req.session.user) {
     var userdetails = {
        _id: req.session.user._id,
        credits: req.session.user.credits,
        location: req.session.user.location
     }
      res.json(userdetails);
  }
  else {
    res.status(401);
    res.send();
  }
})

app.get('/signedin', function(req, res){
  if (req.session.user){
    res.status(200);
    res.send()
  }
  else {
    res.status(401);
    res.send()
  }
})

app.get('*', function(req, res){
  res.send('404, page not found', 404);
});
/*
var options = {
  key: fs.readFileSync('./config/domain.pem'),
  cert: fs.readFileSync('./config/main.pem'),
  ca: [fs.readFileSync('./config/intermediate.pem')]
};
*/
// Create an HTTP service.
http.createServer(app).listen(5000);
// Create an HTTPS service identical to the HTTP service.
//https.createServer(options, app).listen(5001);
