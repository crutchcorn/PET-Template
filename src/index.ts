import 'reflect-metadata';
import {createConnection} from 'typeorm';
import {init} from './config/lib/express'

// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
createConnection().then(async connection => {

  // create express app
  let app = init();

  // run app
  app.listen(3000);

  console.log('Express application is up and running on port 3000');

}).catch(error => console.log('TypeORM connection error: ', error));
