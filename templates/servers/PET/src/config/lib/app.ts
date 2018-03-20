/**
 * Module dependencies.
 */
import * as config from '../config';
import * as express from './express';
import {Express as appType} from "express-serve-static-core";
import * as chalk from 'chalk';
import {createConnection} from 'typeorm';

export function init(callback: (app: appType, config: any) => void) { // TODO: Add typing info
  createConnection()
    .then(async connection => {
      // Initialize express
      var app: appType = express.init();
      if (callback) callback(app, config);
    })
    .catch(error => console.log((<any>chalk).red('TypeORM connection error: ', error)));
};

export function start(callback ?: (app: appType, config: any) => any) {
  init(function (app: appType, config) { // TODO: Add typing info

    // Start the app by listening on <port> at <host>
    app.listen(config.port, config.host, function () {
      // Create server URL
      var server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port;
      // Logging initialization
      console.log('--');
      console.log((<any>chalk).green(config.app.title));
      console.log();
      console.log((<any>chalk).green('Environment:     ' + process.env.NODE_ENV));
      console.log((<any>chalk).green('Server:          ' + server));
      // TODO: Add database information to info here
      // console.log(chalk.green('Database:        ' + config.db.uri));
      console.log((<any>chalk).green('App version:     ' + config.{{camelCase name}}.version));
      // TODO: Add info to {{dashCase name}}-version
      if (config.{{camelCase name}}['{{dashCase name}}-version']) {
        console.log((<any>chalk).green('{{titleCase name}} version:     ' + config.{{camelCase name}}['{{dashCase name}}-version']));
      }
      console.log('--');

      if (callback) callback(app, config);
    });

  });

};
