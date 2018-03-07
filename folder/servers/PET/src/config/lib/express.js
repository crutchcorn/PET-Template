"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Remove `* from`
const logger = require("./logger");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const express = require("express");
const path_1 = require("path");
const helmet = require("helmet");
const session = require("express-session");
const lusca = require("lusca");
const compress = require("compression");
const _ = require("lodash");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const config = require('../config');
const flash = require('connect-flash');
/**
 * Initialize local variables
 * TODO: See if this is all needed
 */
function initLocalVariables(app) {
    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    if (config.secure && config.secure.ssl === true) {
        app.locals.secure = config.secure.ssl;
    }
    app.locals.keywords = config.app.keywords;
    app.locals.googleAnalyticsTrackingID = config.app.googleAnalyticsTrackingID;
    app.locals.facebookAppId = config.facebook.clientID;
    app.locals.twitterUsername = config.twitter.username;
    app.locals.livereload = config.livereload;
    app.locals.logo = config.logo;
    app.locals.favicon = config.favicon;
    app.locals.env = process.env.NODE_ENV;
    app.locals.domain = config.domain;
    // Passing the request url to environment locals
    app.use(function (req, res, next) {
        res.locals.host = req.protocol + '://' + req.hostname;
        res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
        next();
    });
}
exports.initLocalVariables = initLocalVariables;
;
/**
 * Initialize application middleware
 */
function initMiddleware(app) {
    // Should be placed before express.static
    app.use(compress({
        filter: function (req, res) {
            return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));
    // Initialize favicon middleware
    // TODO: See if this is needed
    // app.use(favicon(app.locals.favicon));
    // Enable logger (morgan) if enabled in the configuration file
    if (_.has(config, 'log.format')) {
        app.use(morgan(logger.getLogFormat(), logger.getMorganOptions()));
    }
    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
        // Disable views cache
        app.set('view cache', false);
    }
    else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    }
    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    // Add the cookie parser and flash middleware
    // TODO: See if flash middleware is needed
    app.use(cookieParser());
    app.use(flash());
}
exports.initMiddleware = initMiddleware;
;
/**
 * Configure Express session
 */
function initSession(app) {
    // TODO: Check that there is no more MongoDB stuff
    // Express MongoDB session storage
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        cookie: {
            maxAge: config.sessionCookie.maxAge,
            httpOnly: config.sessionCookie.httpOnly,
            secure: config.sessionCookie.secure && config.secure.ssl
        },
        name: config.sessionKey
    }));
    // Add Lusca CSRF Middleware
    app.use(lusca(config.csrf));
}
exports.initSession = initSession;
;
/**
 * Invoke modules server configuration
 */
function initModulesConfiguration(app) {
    config.files.configs.forEach(function (configPath) {
        require(path_1.resolve(configPath)).default(app);
    });
}
exports.initModulesConfiguration = initModulesConfiguration;
;
/**
 * Configure Helmet headers configuration for security
 */
function initHelmetHeaders(app) {
    // six months expiration period specified in seconds
    var SIX_MONTHS = 15778476;
    app.use(helmet.frameguard());
    app.use(helmet.xssFilter());
    app.use(helmet.noSniff());
    app.use(helmet.ieNoOpen());
    app.use(helmet.hsts({
        maxAge: SIX_MONTHS,
        includeSubdomains: true,
        force: true
    }));
    app.disable('x-powered-by');
}
exports.initHelmetHeaders = initHelmetHeaders;
;
/**
 * Configure the modules ACL policies
 */
function initModulesServerPolicies() {
    // Globbing policy files
    config.files.policies.forEach(function (policyPath) {
        require(path_1.resolve(policyPath)).invokeRolesPolicies();
    });
}
exports.initModulesServerPolicies = initModulesServerPolicies;
;
/**
 * Configure the modules server routes
 */
function initModulesServerRoutes(app) {
    // Globbing routing files
    config.files.routes.forEach(function (routePath) {
        require(path_1.resolve(routePath)).default(app);
    });
}
exports.initModulesServerRoutes = initModulesServerRoutes;
;
/**
 * Configure error handling
 */
function initErrorRoutes(app) {
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) {
            return next();
        }
        // Log it
        console.error(err.stack);
        // Redirect to error page
        res.status(500).json({ "message": err });
    });
}
exports.initErrorRoutes = initErrorRoutes;
;
/**
 * Initialize the Express application
 */
function init() {
    // Initialize express app
    var app = express();
    // Initialize local variables
    this.initLocalVariables(app);
    // Initialize Express middleware
    this.initMiddleware(app);
    // Initialize Helmet security headers
    this.initHelmetHeaders(app);
    // Initialize Express session
    this.initSession(app);
    // Initialize Modules configuration
    this.initModulesConfiguration(app);
    // Initialize modules server authorization policies
    this.initModulesServerPolicies();
    // Initialize modules server routes
    this.initModulesServerRoutes(app);
    // Initialize error routes
    this.initErrorRoutes(app);
    return app;
}
exports.init = init;
//# sourceMappingURL=express.js.map