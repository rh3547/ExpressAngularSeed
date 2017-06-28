
/**
 * Module dependencies
 */
var express         = require('express'),
  bodyParser        = require('body-parser'),
  methodOverride    = require('method-override'),
  errorHandler      = require('express-error-handler'),
  morgan            = require('morgan'),
  http              = require('http'),
  path              = require('path'),
  fs                = require('fs');

var app = module.exports = express();

// API Config
var apiConfig = JSON.parse(fs.readFileSync('./ApiConfig.json', 'utf8'));

// Mongo DB setup
var MongoClient = require('mongodb').MongoClient;

/**
 * Configuration
 */
// All environments
app.engine('ejs', require('express-ejs-extend'));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var env = process.env.NODE_ENV || 'development';

// Development only
if (env === 'development') {
  app.use(errorHandler());
}

// Production only
if (env === 'production') {
  // TODO
}


/**
 * Routes
 */
var indexRoutes = require('./routes/index-routes');

// Database route connection
app.use(function(req, res, next) {
    MongoClient.connect(apiConfig.database_url, function (err, db) {
        if(err) throw err;

        req.db = db;
        next();
    });
});

// API routes
app.use('/api/generic', require('./routes/restapi-routes'));
// more api routes here ...

// Serve index and other views
app.get('/', indexRoutes.index);
app.get('/view/:name', indexRoutes.view);
app.get('/view/:dir/:name', indexRoutes.subView);
app.get('*', indexRoutes.index);


/**
 * Start Server
 */
http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
