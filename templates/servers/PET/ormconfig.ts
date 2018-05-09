import {ConnectionOptions} from 'typeorm';
import {configReturn} from './src/config/config';
const config: configReturn = require('./src/config/config');

const options: ConnectionOptions = {
  // Database type is set here in order to prevent dev and prod from using different databases
  'type': 'postgres',
  'name': 'default',
  'entities': [
    'src/modules/**/models/*.js'
  ],
  'subscribers': [
    'src/subscriber/*.js,'
  ],
  'migrations': [
    'src/migration/*.js'
  ],
  'cli': {
    'migrationsDir': 'src/migration',
    'subscribersDir': 'src/subscriber'
  },
  ...(<ConnectionOptions>config.db)
};

module.exports = options;
