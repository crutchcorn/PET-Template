/**
 * Module dependencies.
 */
// TODO: Remove lodash dep
/**
 * This will be the hardest
 * Combine like arrays
 * Ignore undefined
 * Combine objects
 * Otherwise do {...}
 */
import {merge} from 'lodash';
import chalk from 'chalk';
import {sync} from 'glob';
import {existsSync} from 'fs';
import {resolve, join} from 'path';
import {defaultAssetsType, envAssetsType, mergedAssetsType} from './assets';
import {defaultEnvType, envEnvType, mergedEnvType, secureType} from './env';

/**
 * Checks if item is a string
 */
const isString = (value: any): boolean => {
  return Object.prototype.toString.call(value) === '[object String]';
};

/**
 * Get files by glob patterns
 */
const getGlobbedPaths = function (globPatterns: string | string[], excludes?: string | RegExp[]): string[] {
  // URL paths regex
  const urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

  // The output array
  let output = [];

  // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
  if (Array.isArray(globPatterns)) {
    globPatterns.forEach(globPattern => {
      output = Array.from(new Set([...output, ...getGlobbedPaths(globPattern, excludes)]));
    });
  } else if (isString(globPatterns)) {
    if (urlRegex.test(globPatterns)) {
      output = [...output, globPatterns];
    } else {
      let files = sync(globPatterns);
      if (excludes) {
        files = files.map(file => {
          if (Array.isArray(excludes)) {
            for (const i in excludes) {
              if (excludes.hasOwnProperty(i)) {
                file = file.replace(excludes[i], '');
              }
            }
          } else {
            file = file.replace(excludes, '');
          }
          return file;
        });
      }
      output = Array.from(new Set([...output, ...files]));
    }
  }

  return output;
};

/**
 * Validate NODE_ENV existence
 */
const validateEnvironmentVariable = (): void => {
  var environmentFiles = sync('./config/env/' + process.env.NODE_ENV + '.js');
  console.log();
  if (!environmentFiles.length) {
    if (process.env.NODE_ENV) {
      console.error(chalk.red('+ Error: No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
    } else {
      console.error(chalk.red('+ Error: NODE_ENV is not defined! Using default development environment'));
    }
    process.env.NODE_ENV = 'development';
  }
  // Reset console color
  console.log(chalk.white(''));
};

/** Validate config.domain is set
 */
const validateDomainIsSet = (config: configReturn): void => {
  if (!config.domain) {
    console.log(chalk.red('+ Important warning: config.domain is empty. It should be set to the fully qualified domain of the app.'));
  }
};

/**
 * Validate Secure=true parameter can actually be turned on
 * because it requires certs and key files to be available
 */
const validateSecureMode = (config: mergedEnvType & {secure?: secureType}): secureType => {

  if (!config.secure || config.secure.ssl !== true) {
    return config.secure;
  }

  // Change to be async
  const privateKey = existsSync(resolve(config.secure.privateKey));
  const certificate = existsSync(resolve(config.secure.certificate));

  if (!privateKey || !certificate) {
    console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
    console.log(chalk.red('  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh'));
    console.log();
    return {...config.secure, ssl: false}
  } else {
    return config.secure;
  }
};

/**
 * Validate Session Secret parameter is not set to default in production
 */
const validateSessionSecret = (config: mergedEnvType, testing?: boolean): boolean => {

  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  if (config.sessionSecret === 'MEAN') {
    if (!testing) {
      console.log(chalk.red('+ WARNING: It is strongly recommended that you change sessionSecret config while running in production!'));
      console.log(chalk.red('  Please add `sessionSecret: process.env.SESSION_SECRET || \'super amazing secret\'` to '));
      console.log(chalk.red('  `config/env/production.js` or `config/env/local.js`'));
      console.log();
    }
    return false;
  } else {
    return true;
  }
};

/**
 * Initialize global configuration files
 */
const initGlobalConfigFolders = (config: mergedEnvType, assets: mergedAssetsType): foldersType => {
  // Appending files
  return {
  };

};

/**
 * Initialize global configuration files
 */
const initGlobalConfigFiles = (config: mergedEnvType, assets: mergedAssetsType): filesType => {
  // Appending files
  return {
    // Setting Globbed model files
    models: getGlobbedPaths(assets.models),
    // Setting Globbed route files
    routes: getGlobbedPaths(assets.routes),
    // Setting Globbed config files
    configs: getGlobbedPaths(assets.config),
    // Setting Globbed policies files
    policies: getGlobbedPaths(assets.policies)
  };
};

/**
 * Initialize global configuration
 */
const initGlobalConfig = (): configReturn => {
  // Validate NODE_ENV existence
  validateEnvironmentVariable();

  // Get the default assets
  const defaultAssets: defaultAssetsType = require(join(process.cwd(), '/src/config/assets/default'));

  // Get the current assets
  const environmentAssets: envAssetsType = require(join(process.cwd(), '/src/config/assets/', process.env.NODE_ENV)) || {};

  // Merge assets
  let assets: mergedAssetsType = merge(defaultAssets, environmentAssets);

  // Get the default config
  const defaultConfig: defaultEnvType = require(join(process.cwd(), '/src/config/env/default'));

  // Get the current config
  const environmentConfig: envEnvType = require(join(process.cwd(), '/src/config/env/', process.env.NODE_ENV)) || {};

  // Merge config files
  let tmpConfig: mergedEnvType & packageJSONType = {
    ...merge(defaultConfig, environmentConfig),
    // read package.json for {{{name}}} project information
    {{camelCase name}}: require(resolve('./package.json'))
  };

  // Extend the config object with the local-NODE_ENV.js custom/local environment. This will override any settings present in the local configuration.
  tmpConfig = merge(tmpConfig, ((existsSync(join(process.cwd(), '/src/config/env/local-' + process.env.NODE_ENV + '.js')) && require(join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js')))) || {});

  const config: configReturn = {
    ...tmpConfig,
    // Initialize global globbed files
    files: initGlobalConfigFiles(tmpConfig, assets),
    // Initialize global globbed folders
    folders: initGlobalConfigFolders(tmpConfig, assets),
    // Validate Secure SSL mode can be used
    ...((<typeof tmpConfig & {secure?: secureType}>tmpConfig).secure ? {secure: validateSecureMode(tmpConfig)} : {}),
    // Expose configuration utilities
    utils: {
      getGlobbedPaths: getGlobbedPaths,
      validateSessionSecret: validateSessionSecret
    }
  };

    // Validate session secret
  validateSessionSecret(config);

  // Print a warning if config.domain is not set
  validateDomainIsSet(config);

  return config as configReturn;
};

export type configReturn = configObject & mergedEnvType;

interface filesType {
    models: string[],
    routes: string[],
    configs: string[],
    policies: string[]
};

interface packageJSONType {
  {{camelCase name}}: any
}

interface foldersType {};

interface configObject extends packageJSONType {
  files: filesType,
  folders: foldersType,
  utils: {
    getGlobbedPaths: (globPatterns: string | string[], excludes?: string | RegExp[]) => string[],
    validateSessionSecret: (config: mergedEnvType, testing?: boolean) => boolean
  }
}

/**
 * Set configuration object
 */
module.exports = initGlobalConfig() as configReturn;
