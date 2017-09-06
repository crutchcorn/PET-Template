import 'reflect-metadata';
import {createConnection} from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import {sync} from 'glob';
import {resolve} from 'path';

// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
createConnection().then(async connection => {

  // create express app
  const app = express();
  app.use(bodyParser.json());

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
