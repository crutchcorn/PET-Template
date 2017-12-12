import {init} from './testpress';
import {createConnection} from 'typeorm';
import chalk from 'chalk';

export function start() {
  createConnection()
    .then(async connection => {
      // Initialize express
      var app = init();
    })
    .catch(error => console.log((<any>chalk).red('TypeORM connection error: ', error)));
}