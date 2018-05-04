/**
 * Module dependencies.
 */
import {configReturn} from '../config';
const config: configReturn = require('../config');
import {init as expressInit} from './express';
import {Express as appType} from "express-serve-static-core";
import chalk from 'chalk';
import {createConnection} from 'typeorm';

export function init(callback: (app: appType, config: configReturn) => void) {
  createConnection()
    .then(async connection => {
      // Initialize express
      var app: appType = expressInit();
      if (callback) callback(app, config);
    })
    .catch(error => console.log(chalk.red('TypeORM connection error: ', error)));
}

export function start(callback?: (app: appType, config: configReturn) => any) {
  init(function (app: appType, config: configReturn) {

    // Start the app by listening on <port> at <host>
    app.listen(<number>config.port, config.host, function () {
      // Create server URL
      var server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port;
      // Logging initialization
      console.log('--');
      console.log(chalk.green(config.app.title));
      console.log();
      console.log(chalk.green('Environment:     ' + process.env.NODE_ENV));
      console.log(chalk.green('Server:          ' + server));
      // TODO: Add database information to info here
      // TODO: Fix the styling of spacing
      // console.log(chalk.green('Database:        ' + config.db.uri));
      console.log(chalk.green('App version:     ' + config.{{camelCase name}}.version));
      // TODO: Add info to {{dashCase name}}-version
      if (config.{{camelCase name}}['{{dashCase name}}-version']) {
        console.log(chalk.green('{{titleCase name}} version:     ' + config.{{camelCase name}}['{{dashCase name}}-version']));
      }
      console.log('--');

      if (callback) callback(app, config);
    });

  });

};
