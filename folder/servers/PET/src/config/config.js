"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
const _ = require("lodash");
const chalk = require("chalk");
const glob_1 = require("glob");
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Get files by glob patterns
 */
const getGlobbedPaths = function (globPatterns, excludes) {
    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
    // The output array
    var output = [];
    // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function (globPattern) {
            output = _.union(output, getGlobbedPaths(globPattern, excludes));
        });
    }
    else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        }
        else {
            var files = glob_1.sync(globPatterns);
            if (excludes) {
                files = files.map(function (file) {
                    if (_.isArray(excludes)) {
                        for (var i in excludes) {
                            if (excludes.hasOwnProperty(i)) {
                                file = file.replace(excludes[i], '');
                            }
                        }
                    }
                    else {
                        file = file.replace(excludes, '');
                    }
                    return file;
                });
            }
            output = _.union(output, files);
        }
    }
    return output;
};
/**
 * Validate NODE_ENV existence
 */
const validateEnvironmentVariable = function () {
    var environmentFiles = glob_1.sync('./config/env/' + process.env.NODE_ENV + '.js');
    console.log();
    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            console.error(chalk.red('+ Error: No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
        }
        else {
            console.error(chalk.red('+ Error: NODE_ENV is not defined! Using default development environment'));
        }
        process.env.NODE_ENV = 'development';
    }
    // Reset console color
    console.log(chalk.white(''));
};
/** Validate config.domain is set
 */
const validateDomainIsSet = function (config) {
    if (!config.domain) {
        console.log(chalk.red('+ Important warning: config.domain is empty. It should be set to the fully qualified domain of the app.'));
    }
};
/**
 * Validate Secure=true parameter can actually be turned on
 * because it requires certs and key files to be available
 */
const validateSecureMode = function (config) {
    if (!config.secure || config.secure.ssl !== true) {
        return true;
    }
    var privateKey = fs_1.existsSync(path_1.resolve(config.secure.privateKey));
    var certificate = fs_1.existsSync(path_1.resolve(config.secure.certificate));
    if (!privateKey || !certificate) {
        console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
        console.log(chalk.red('  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh'));
        console.log();
        config.secure.ssl = false;
    }
};
/**
 * Validate Session Secret parameter is not set to default in production
 */
const validateSessionSecret = function (config, testing) {
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
    }
    else {
        return true;
    }
};
/**
 * Initialize global configuration files
 */
var initGlobalConfigFolders = function (config, assets) {
    // Appending files
    config.folders = {};
};
/**
 * Initialize global configuration files
 */
var initGlobalConfigFiles = function (config, assets) {
    // Appending files
    config.files = {};
    // Setting Globbed model files
    config.files.models = getGlobbedPaths(assets.models);
    // Setting Globbed route files
    config.files.routes = getGlobbedPaths(assets.routes);
    // Setting Globbed config files
    config.files.configs = getGlobbedPaths(assets.config);
    // Setting Globbed policies files
    config.files.policies = getGlobbedPaths(assets.policies);
};
/**
 * Initialize global configuration
 */
var initGlobalConfig = function () {
    // Validate NODE_ENV existence
    validateEnvironmentVariable();
    // Get the default assets
    const defaultAssets = require(path_1.join(process.cwd(), '/src/config/assets/default'));
    // Get the current assets
    const environmentAssets = require(path_1.join(process.cwd(), '/src/config/assets/', process.env.NODE_ENV)) || {};
    // Merge assets
    let assets = _.merge(defaultAssets, environmentAssets);
    // Get the default config
    const defaultConfig = require(path_1.join(process.cwd(), '/src/config/env/default'));
    // Get the current config
    // TODO: Remove `any`
    const environmentConfig = require(path_1.join(process.cwd(), '/src/config/env/', process.env.NODE_ENV)) || {};
    // Merge config files
    let config = _.merge(defaultConfig, environmentConfig);
    // read package.json for MEAN.JS project information
    const pkg = require(path_1.resolve('./package.json'));
    config.pet = pkg;
    // Extend the config object with the local-NODE_ENV.js custom/local environment. This will override any settings present in the local configuration.
    config = _.merge(config, (fs_1.existsSync(path_1.join(process.cwd(), '/src/config/env/local-' + process.env.NODE_ENV + '.js')) && require(path_1.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js'))) || {});
    // Initialize global globbed files
    initGlobalConfigFiles(config, assets);
    // Initialize global globbed folders
    initGlobalConfigFolders(config, assets);
    // Validate Secure SSL mode can be used
    validateSecureMode(config);
    // Validate session secret
    validateSessionSecret(config);
    // Print a warning if config.domain is not set
    validateDomainIsSet(config);
    // Expose configuration utilities
    config.utils = {
        getGlobbedPaths: getGlobbedPaths,
        validateSessionSecret: validateSessionSecret
    };
    return config;
};
/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
//# sourceMappingURL=config.js.map