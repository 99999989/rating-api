var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// Routes
var routes = require('./routes/index');
var users = require('./routes/users');
var ratings = require('./routes/ratings');
var resources = require('./routes/resources');
var matching = require('./routes/matching');

var app = express();

// DB setup
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/ratingApiDb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connection to DB established');
    // Session setup
    app.use(cookieParser('mySecret'));
    app.use(session({
        secret: 'mySecret',
        saveUninitialized: true, // create session until something stored
        resave: true, // save session if unmodified
        store: new MongoStore({mongooseConnection: mongoose.connection}),
        proxy: true
    }));

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use(express.static(path.join(__dirname, 'public/frontend')));


    // Disable cache explicitly
    app.use(function noCache(req, res, next) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        next();
    });

    // Routes
    app.use('/api/users', users);
    app.use('/api/ratings', ratings);
    app.use('/api/resources', resources);
    app.use('/api/matching', matching);
    app.use('/api/', routes);
    app.use('/', function(req, res, next) {
        res.redirect('/api/');
    });

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

});

module.exports = app;
