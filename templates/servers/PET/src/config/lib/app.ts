/**
 * Module dependencies.
 */
import {configReturn} from '../config';
const config: configReturn = require('../config');
import {init as expressInit} from './express';
import {Express as appType} from "express-serve-static-core";
import chalk from 'chalk';
import {Connection, createConnection} from 'typeorm';

const spaces = 5;
const maxSize = Math.max(...[
  'Environment',
  'Server',
  'App version',
  'Database',
  '{{titleCase name}} version'
].map(text => text.length)) + 1;

export function init(callback: (app: appType, config: configReturn, connection: Connection) => void) {
  createConnection()
    .then(async connection => {
      // Initialize express
      var app: appType = expressInit();
      if (callback) callback(app, config, connection);
    })
    .catch(error => console.log(chalk.red('TypeORM connection error: ', error)));
}

export function start(callback?: (app: appType, config: configReturn) => any) {
  init(function (app: appType, config: configReturn, connection: Connection) {

    // Start the app by listening on <port> at <host>
    app.listen(<number>config.port, config.host, function () {
      // Create server URL
      var server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port;
      // Logging initialization
      console.log('--');
      console.log(chalk.green(config.app.title));
      console.log();
      console.log(chalk.green('Environment:' + ' '.repeat((maxSize - 'Environment'.length) + spaces) + process.env.NODE_ENV));
      console.log(chalk.green('Server:'  + ' '.repeat((maxSize - 'Server'.length) + spaces) + server));
      const optsDB = connection.options.database;
      const optsURL = (<{url: string}>connection.options).url;
      const optsLoc = (<{location: string}>connection.options).location;
      let location: string = '';
      if (optsURL) {
        // MySQL
        location = optsURL;
      } else if (optsDB && !Array.isArray(optsDB)) {
        // SQLite
        location = <string>connection.options.database;
      } else if (optsLoc) {
        // SQLjs
        location = optsLoc;
      }
      console.log(chalk.green('Database:' + ' '.repeat((maxSize - 'Database'.length) + spaces) + location));
      console.log(chalk.green('App version:'  + ' '.repeat((maxSize - 'App version'.length) + spaces) + config.{{camelCase name}}.version));
      if (config.{{camelCase name}}['{{dashCase name}}-version']) {
        console.log(chalk.green('{{titleCase name}} version:'  + ' '.repeat((maxSize - '{{titleCase name}} version'.length) + spaces) +  config.{{camelCase name}}['{{dashCase name}}-version']));
      }
      console.log('--');

      if (callback) callback(app, config);
    });

  });

};
