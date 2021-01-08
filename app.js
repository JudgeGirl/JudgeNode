var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var i18n = require('i18n');

var routes = require('./routes/index');
var users = require('./routes/users');
var admins = require('./routes/admins');
var _config = require('./lib/config').config;
var utils = require('./lib/components/utils');
const { loggerFactory } = require('lib/components/LoggerFactory');

var app = express();

i18n.configure({
    // setup some locales - other locales default to en silently
    locales: ['en', 'zhtw'],

    defaultLocale: ['en'],
    // sets a custom cookie name to parse locale settings from
    cookie: 'locale',

    // where to store json files - defaults to './locales'
    directory: __dirname + '/locales'
});
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// only allow https and with domain judgegirl.csie.org
if (_config.HOST.https_only) {
    app.use(function(req, res, next) {
        if (req.headers.host != _config.HOST.HOSTNAME) {
            var unite = _config.HOST.HOSTNAME;
            req.headers.host = unite;
            res.redirect('https://' + req.headers.host + req.url);
        } else if (req.secure) {
            next();
        } else {
            res.redirect('https://' + req.headers.host + req.url);
        }
    });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(i18n.init);

// session
const RedisStore = require('connect-redis')(session);
const { redisClient } = require("./lib/components/RedisClient");
app.use(session({
    store: new RedisStore({ client: redisClient.getClient() }),
    cookie: {
        path: '/', // important !!
        httpOnly: false,
        maxAge: 6 * 60 * 60 * 1000
    },
    secret: 'ej3ej3su3bp6sk7',
    resave: false,
    saveUninitialized: false
}));

// Register access logger.
app.use(loggerFactory.getAccessLogMiddleware());

// Inject user, config
app.use(function(req, res, next) {
    res.locals.__ = res.__ = function() {
        return i18n.__.apply(req, arguments);
    };
    res.locals.user = req.session;
    res.locals.site = _config;
    res.locals.site.url_for = utils.url_for;
    res.locals.site.unitConvert = utils.unitConvert;
    next();
});

app.use(utils.url_for('/'), express.static(path.join(__dirname, 'public')));

// For files that is not part of the website.
app.use(utils.url_for('/'), express.static(_config.RESOURCE.public.root));

app.use(utils.url_for('admin'), admins);
app.use(utils.url_for('user'), users);
app.use(utils.url_for('/'), routes);
app.get(utils.url_for('/i18n/:locale'), function(req, res) {
    res.cookie('locale', req.params.locale);
    req.session.locale = req.params.locale;
    //    i18n.setLocale(req, req.params.locale);
    if (req.headers.referer) res.redirect(req.headers.referer);
    else res.redirect(utils.url_for('/'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if ( _config.JUDGE.env === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            user: null
        });
        next();
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        user: null
    });
    next();
});


module.exports = app;
