import {resolve} from 'path';
import * as express from 'express';

const config = require('../config');


export function initModulesConfiguration(app): void {
  config.files.configs.forEach(function (configPath) {
    require(resolve(configPath)).default(app);
    // console.log(configPath);
  });
};


/**
 * Configure the modules ACL policies
 */
export function initModulesServerPolicies(app): void {
  // Globbing policy files
  config.files.policies.forEach(function (policyPath) {
    require(resolve(policyPath)).invokeRolesPolicies();
    // console.log(policyPath);
  });
};

/**
 * Configure the modules server routes
 */
export function initModulesServerRoutes(app): void {
  // Globbing routing files
  config.files.routes.forEach(function (routePath) {
    require(resolve(routePath)).default(app);
    // console.log(routePath);
  });
};


export function init() {
  var app = express();

  initModulesConfiguration(app);
  initModulesServerPolicies(app);
  initModulesServerRoutes(app);
}