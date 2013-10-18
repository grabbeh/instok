
var express = require('express')
, app = express()
, mongoose = require('mongoose')
, alert = require('./routes/alert')
, payment = require('./routes/payment')
, db = require('./config/db')
, user = require('./routes/user')
, template = require('./routes/template')
, https = require('https')
, http = require('http')
, fs = require('fs')
, winston = require('winston');

winston.add(winston.transports.File, { filename: 'logfile.log' });
winston.remove(winston.transports.Console);

mongoose.connect('mongodb://' 
  + db.details.user + ':' 
  + db.details.pass + '@' 
  + db.details.host + ':' 
  + db.details.port + '/' 
  + db.details.name );

app.configure(function(){
  app.enable('trust proxy')
  app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat',
                            cookie: { httpOnly: false }
}));        
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

// Middleware

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/#/login');
  }
}

// Routes

app.get('/', function(req, res){
  res.sendfile(__dirname + '/public/views/index.html')
});

// Alerts API

app.get('/alerts', restrict, alert.getAlerts);

app.get('/sentalerts', restrict, alert.getSentAlerts);

app.get('/alerts/:id', restrict, alert.getAlert);

app.post('/alerts/:id', restrict, alert.postAlert);

app.delete('/alerts/:id', restrict, alert.deleteAlert);

app.put('/alerts/:id', restrict, alert.editAlert);

app.post('/sendalert/:id', restrict, alert.sendAlert);

// Templates API

app.post('/templates', restrict, template.addTemplate);

app.get('/templates', restrict, template.getTemplates);

app.put('/templates/:id', restrict, template.editTemplate);

app.delete('/templates/:id', restrict, template.deleteTemplate);

app.get('/templates/:id', restrict, template.getTemplate);

// Stripe payment

app.post('/addcredit', restrict, payment.createCharge);

// Authentication

app.post('/signup', user.createaccount);

app.post('/login', user.logIn);
  
app.get('/logout', user.logOut);

app.put('/user', user.updateaccount);

app.get('/currentuser', user.currentUser)

app.get('/signedin', user.signedIn);

// 404

app.get('*', function(req, res){
  res.send('404, page not found', 404);
});


var options = {
  key: fs.readFileSync('./config/domain.pem'),
  cert: fs.readFileSync('./config/main.pem'),
  ca: [fs.readFileSync('./config/intermediate.pem')]
};

// Create an HTTP service.
http.createServer(app).listen(5000);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(5001);
