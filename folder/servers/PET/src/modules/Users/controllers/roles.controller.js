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
const role_model_1 = require("../models/role.model");
/**
 * Saves given post.
 */
function roleSaveAction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // get a post repository to perform operations with post
        const roleRepository = typeorm_1.getManager().getRepository(role_model_1.Role);
        // create a real post object from post json object sent over http
        const newRole = roleRepository.create(req.body);
        // save received post
        yield roleRepository.save(newRole);
        // return saved post back
        res.send(newRole);
    });
}
exports.roleSaveAction = roleSaveAction;
function roleGetAllAction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // get a post repository to perform operations with post
        const roleRepository = typeorm_1.getManager().getRepository(role_model_1.Role);
        // load a post by a given post id
        const roles = yield roleRepository.find();
        // return loaded posts
        res.send(roles);
    });
}
exports.roleGetAllAction = roleGetAllAction;
//# sourceMappingURL=roles.controller.js.map