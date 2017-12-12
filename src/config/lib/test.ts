/**
 * Module dependencies.
 */
import * as config from '../config';
import * as express from './express';
import {Express as appType} from "express-serve-static-core";
import * as chalk from 'chalk';
import {createConnection} from 'typeorm';

export function start() { // TODO: Add typing info
  createConnection()
    .then(async connection => {
      // Initialize express
      let app: appType = express.init();
      app.listen(3000);
      console.log('Express application is up and running on port 3000');
    })
    .catch(error => console.log((<any>chalk).red('TypeORM connection error: ', error)));
};
