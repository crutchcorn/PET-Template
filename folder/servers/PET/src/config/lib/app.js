"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
const config = require("../config");
const express = require("./express");
const chalk = require("chalk");
const typeorm_1 = require("typeorm");
function init(callback) {
    typeorm_1.createConnection()
        .then((connection) => __awaiter(this, void 0, void 0, function* () {
        // Initialize express
        var app = express.init();
        if (callback)
            callback(app, config);
    }))
        .catch(error => console.log(chalk.red('TypeORM connection error: ', error)));
}
exports.init = init;
;
function start(callback) {
    init(function (app, config) {
        // Start the app by listening on <port> at <host>
        app.listen(config.port, config.host, function () {
            // Create server URL
            var server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port;
            // Logging initialization
            console.log('--');
            console.log(chalk.green(config.app.title));
            console.log();
            console.log(chalk.green('Environment:     ' + process.env.NODE_ENV));
            console.log(chalk.green('Server:          ' + server));
            // TODO: Add database information to info here
            // console.log(chalk.green('Database:        ' + config.db.uri));
            console.log(chalk.green('App version:     ' + config.pet.version));
            // TODO: Add info to pet-version
            if (config.pet['pet-version']) {
                console.log(chalk.green('PET version:     ' + config.pet['pet-version']));
            }
            console.log('--');
            if (callback)
                callback(app, config);
        });
    });
}
exports.start = start;
;
//# sourceMappingURL=app.js.map