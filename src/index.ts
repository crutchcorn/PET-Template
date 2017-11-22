import 'reflect-metadata';
import {createConnection} from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as lusca from 'lusca';
import {sync} from 'glob';
import {resolve} from 'path';
// import flash = require('connect-flash');

// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
createConnection().then(async connection => {

  // create express app
  const app = express();
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
  app.use(lusca({
    csrf: false,
    csp: false,
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    xssProtection: true
  }))
  app.use(bodyParser.json());

  sync('src/modules/*/config/*.js').forEach(configPath => {
    require(resolve(configPath)).default(app);
  });

  sync('src/modules/*/policies/*.js').forEach(policyPath => {
    require(resolve(policyPath)).invokeRolesPolicies();
  });


  sync('src/modules/*/routes/*.js').forEach(routePath => {
    require(resolve(routePath)).default(app);
  });

  // run app
  app.listen(3000);

  console.log('Express application is up and running on port 3000');

}).catch(error => console.log('TypeORM connection error: ', error));
