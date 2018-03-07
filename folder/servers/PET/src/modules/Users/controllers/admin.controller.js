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
const typeorm_1 = require("typeorm");
const user_model_1 = require("../models/user.model");
// errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
const userRepository = typeorm_1.getManager().getRepository(user_model_1.User);
/**
 * Show the current user
 */
function read(req, res) {
    userRepository.findOneById(req.params.userId)
        .then(user => res.json(user));
}
exports.read = read;
/**
 * Update a User
 */
function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userRepository.findOneById(req.params.userId);
        // For security purposes only merge these parameters
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.displayName = user.firstName + ' ' + user.lastName;
        user.roles = req.body.roles;
        yield userRepository.save(user);
        res.json(user);
    });
}
exports.update = update;
/**
 * Delete a user
 */
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userRepository.findOneById(req.params.userId);
        yield userRepository.remove(user);
        res.json(user);
    });
}
exports.deleteUser = deleteUser;
/**
 * List of Users
 */
function list(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield userRepository.find();
        res.json(users);
    });
}
exports.list = list;
/**
 * User middleware
 */
function userByID(req, res, next, id) {
    next();
}
exports.userByID = userByID;
;
//# sourceMappingURL=admin.controller.js.map