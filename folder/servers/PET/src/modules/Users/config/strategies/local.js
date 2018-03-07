"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = require("passport");
const passport_local_1 = require("passport-local");
const user_model_1 = require("../../models/user.model");
const typeorm_1 = require("typeorm");
let userRepository = typeorm_1.getManager().getRepository(user_model_1.User);
module.exports = function () {
    // Use local strategy
    passport_1.use(new passport_local_1.Strategy({
        usernameField: 'usernameOrEmail',
        passwordField: 'password'
    }, function (usernameOrEmail, password, done) {
        userRepository
            .createQueryBuilder('user')
            .where('user.username = :username OR user.email = :email', {
            username: usernameOrEmail.toLowerCase(),
            email: usernameOrEmail.toLowerCase()
        })
            .addSelect('user.password')
            .getOne().then((user) => {
            if (!user || !user.authenticate(password)) {
                done(null, false, {
                    message: 'Invalid username or password (' + (new Date()).toLocaleTimeString() + ')'
                });
            }
            else {
                done(null, user);
            }
        }).catch(err => done(null, false, {
            message: "An error occured when trying to signin"
        }));
    }));
};
//# sourceMappingURL=local.js.map