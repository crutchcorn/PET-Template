import {configReturn} from '../config';

const config: configReturn = require('../config');
import chalk from 'chalk';
import {Options as MorganOptions} from 'morgan';
import {openSync} from 'fs';
import * as winston from 'winston';
import {LoggerInstance} from 'winston';

interface logOptions {
  level: 'debug',
  colorize: false,
  filename: string,
  timestamp: true,
  maxsize: number,
  maxFiles: number,
  json: boolean,
  eol: '\n',
  tailable: true,
  showLevel: true,
  handleExceptions: true,
  humanReadableUnhandledException: true
}

export interface Logger extends LoggerInstance {
  setupFileLogger?: () => boolean,
  getLogOptions?: () => false | logOptions,
  getMorganOptions?: () => MorganOptions,
  getLogFormat?: () => string
}

// list of valid formats for the logging
const validFormats: string[] = ['combined', 'common', 'dev', 'short', 'tiny'];

// Instantiating the default winston application logger with the Console
// transport
let logger: Logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      colorize: true,
      showLevel: true,
      handleExceptions: true,
      humanReadableUnhandledException: true
    })
  ],
  exitOnError: false
});

/**
 * Instantiate a winston's File transport for disk file logging
 *
 */
logger.setupFileLogger = function setupFileLogger(): boolean {

  const fileLoggerTransport = this.getLogOptions();
  if (!fileLoggerTransport) {
    return false;
  }

  try {
    // Check first if the configured path is writable and only then
    // instantiate the file logging transport
    if (openSync(fileLoggerTransport.filename, 'a+')) {
      logger.add(winston.transports.File, fileLoggerTransport);
    }

    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.log();
      console.log(chalk.red('An error has occured during the creation of the File transport logger.'));
      console.log(chalk.red(err));
      console.log();
    }

    return false;
  }

};

/**
 * The options to use with winston logger
 *
 * Returns a Winston object for logging with the File transport
 */
logger.getLogOptions = function getLogOptions(): false | logOptions {

  const configFileLogger = config.log.fileLogger;

  const logFileConfig = !(Object.getOwnPropertyNames(configFileLogger).includes('directoryPath')
    || Object.getOwnPropertyNames(configFileLogger).includes('fileName'));

  if (logFileConfig) {
    console.log('unable to find logging file configuration');
    return false;
  }

  let logPath: string = configFileLogger.directoryPath + '/' + configFileLogger.fileName;

  return {
    level: 'debug',
    colorize: false,
    filename: logPath,
    timestamp: true,
    maxsize: configFileLogger.maxsize ? configFileLogger.maxsize : 10485760,
    maxFiles: configFileLogger.maxFiles ? configFileLogger.maxFiles : 2,
    json: Object.getOwnPropertyNames(configFileLogger).includes('json') ?
      configFileLogger.json : false,
    eol: '\n',
    tailable: true,
    showLevel: true,
    handleExceptions: true,
    humanReadableUnhandledException: true
  };
};

/**
 * The options to use with morgan logger
 *
 * Returns a log.options object with a writable stream based on winston
 * file logging transport (if available)
 */
logger.getMorganOptions = function getMorganOptions(): MorganOptions {
  return {
    stream: {
      write: function (msg: string) {
        logger.info(msg);
      }
    }
  };
};

/**
 * The format to use with the logger
 *
 * Returns the log.format option set in the current environment configuration
 */
logger.getLogFormat = function getLogFormat(): string {
  let format: string = config.log && config.log.format ? config.log.format.toString() : 'combined';

  // make sure we have a valid format
  if (!validFormats.includes(format)) {
    format = 'combined';

    if (process.env.NODE_ENV !== 'test') {
      console.log();
      console.log(chalk.yellow('Warning: An invalid format was provided. The logger will use the default format of "' + format + '"'));
      console.log();
    }
  }

  return format;
};

logger.setupFileLogger();

export default logger;
