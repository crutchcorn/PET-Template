// TODO: Remove `* from`
import * as logger from './logger';
import * as bodyParser from 'body-parser';
import * as favicon from 'serve-favicon';
import * as methodOverride from 'method-override';
import * as express from 'express';
import {resolve} from 'path';
import * as helmet from 'helmet';
import * as session from 'express-session';
import * as lusca from 'lusca';
import * as compress from 'compression';
import * as _ from 'lodash';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import {Request, Response, NextFunction} from 'express';
import {Express as appType} from 'express-serve-static-core';

const config = require('../config');
const flash = require('connect-flash');

/**
 * Initialize local variables
 * TODO: See if this is all needed
 */
export function initLocalVariables(app: appType): void {
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


/**
 * Initialize application middleware
 */
export function initMiddleware(app: appType): void {
  // Should be placed before express.static
  app.use(compress({
    filter: function (req, res) {
      return (/json|text|javascript|css|font|svg/).test(<string>res.getHeader('Content-Type'));
    },
    level: 9
  }));

  // Initialize favicon middleware
  // TODO: See if this is needed
  // app.use(favicon(app.locals.favicon));

  // Enable logger (morgan) if enabled in the configuration file
  // TODO: Remove lodash
  // TODO: getOwnPropertyNames
  if (_.has(config, 'log.format')) {
    app.use(morgan((<any>logger).getLogFormat(), (<any>logger).getMorganOptions()));
  }

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Disable views cache
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
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

/**
 * Configure Express session
 */
export function initSession(app: appType, store: session.MemoryStore): void {
  // Express session storage
  app.use(session({
    saveUninitialized: true,
    resave: true,
    rolling: true,
    secret: config.sessionSecret,
    cookie: {
      maxAge: config.sessionCookie.maxAge,
      httpOnly: config.sessionCookie.httpOnly,
      secure: config.sessionCookie.secure && config.secure.ssl
    },
    name: config.sessionKey,
    store: store
  }));

  // Add Lusca CSRF Middleware
  app.use(lusca(config.csrf));
}

/**
 * Invoke modules server configuration
 */
export function initModulesConfiguration(app: appType): void {
  config.files.configs.forEach(function (configPath) {
    require(resolve(configPath)).default(app);
  });
}

/**
 * Configure Helmet headers configuration for security
 */
export function initHelmetHeaders(app: appType): void {
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

/**
 * Configure the modules ACL policies
 */
export function initModulesServerPolicies(): void {
  // Globbing policy files
  config.files.policies.forEach(function (policyPath) {
    require(resolve(policyPath)).invokeRolesPolicies();
  });
}

/**
 * Configure the modules server routes
 */
export function initModulesServerRoutes(app: appType): void {
  // Globbing routing files
  config.files.routes.forEach(function (routePath) {
    require(resolve(routePath)).default(app);
  });
}

/**
 * Configure error handling
 */
export function initErrorRoutes(app: appType): void {
  app.use(function (err, req: Request, res: Response, next: NextFunction) {
    // If the error object doesn't exists
    if (!err) {
      return next();
    }

    // Log it
    console.error(err.stack);

    // Redirect to error page
    res.status(500).json({'message': err});
  });
}


/**
 * Configure Socket.io
 */
export function configureSocketIO(app: appType, store: session.MemoryStore) {
  // Load the Socket.io configuration
  const server = require('./socket.io').default(app, store);

  // Return server object
  return server;
}

/**
 * Initialize the Express application
 */
export function init(): appType {
  // Initialize express app
  var app: appType = express();
  const store = new session.MemoryStore;

  // Initialize local variables
  this.initLocalVariables(app);

  // Initialize Express middleware
  this.initMiddleware(app);

  // Initialize Helmet security headers
  this.initHelmetHeaders(app);

  // Initialize Express session
  this.initSession(app, store);

  // Initialize Modules configuration
  this.initModulesConfiguration(app);

  // Initialize modules server authorization policies
  this.initModulesServerPolicies();

  // Initialize modules server routes
  this.initModulesServerRoutes(app);

  // Initialize error routes
  this.initErrorRoutes(app);

  // Configure Socket.io
  app = this.configureSocketIO(app, store);

  return app;
}