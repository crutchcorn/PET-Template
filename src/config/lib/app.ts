/**
 * Module dependencies.
 */
import * as config from '../config';
import * as express from './express';
import * as chalk from 'chalk';
import {createConnection} from 'typeorm';

export function init(callback: (app: any, config: any) => any) { // TODO: Add typing info
  createConnection()
    .then(async connection => {
      // Initialize express
      var app = express.init();
      if (callback) callback(app, config);
    })
    .catch(error => console.log('TypeORM connection error: ', error));
};

export function start(callback ?: (app: any, config: any) => any) {
  init(function (app, config) { // TODO: Add typing info

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
      console.log((<any>chalk).green('App version:     ' + config.pet.version));
      // TODO: Add info to pet-version
      if (config.pet['pet-version']) {
        console.log((<any>chalk).green('MEAN.JS version: ' + config.meanjs['meanjs-version']));
      }
      console.log('--');

      if (callback) callback(app, config);
    });

  });

};
