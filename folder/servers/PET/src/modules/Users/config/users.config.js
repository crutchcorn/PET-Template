"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const typeorm_1 = require("typeorm");
const passport_1 = require("passport");
const path_1 = require("path");
const config = require(path_1.resolve('./src/config/config'));
let userRepository = typeorm_1.getManager().getRepository(user_model_1.User);
function default_1(app) {
    // Serialize sessions
    // TODO: Make done function more type safe
    passport_1.serializeUser(function (user, done) {
        done(null, user.id);
    });
    // Deserialize sessions
    passport_1.deserializeUser(function (id, done) {
        userRepository
            .createQueryBuilder('row')
            .addSelect('row.password')
            .addSelect('row.salt')
            .leftJoinAndSelect("row.roles", "role")
            .where('row.id = :id', { id: id })
            .getOne()
            .then((user) => {
            done(null, user);
        }).catch((err) => {
            done(err, null);
        });
    });
    // Initialize strategies
    config.utils.getGlobbedPaths(path_1.join(__dirname, './strategies/**/*.js')).forEach(function (strategy) {
        require(path_1.resolve(strategy))(config);
    });
    // Add passport's middleware
    app.use(passport_1.initialize());
    app.use(passport_1.session());
    app.use((req, res, next) => {
        if (!req.user) {
            return next();
        }
        ;
        req.session.cookie.maxAge = config.sessionCookie.maxAge;
        next();
    });
}
exports.default = default_1;
//# sourceMappingURL=users.config.js.map