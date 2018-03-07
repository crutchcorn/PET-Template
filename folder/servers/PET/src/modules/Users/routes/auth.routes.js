"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_controller_1 = require("../controllers/users.controller");
const users_password_controller_1 = require("../controllers/users/users.password.controller");
/**
 * Module dependencies
 */
function default_1(app) {
    // Setting up the users password api
    app.route('/api/auth/forgot')
        .post(users_password_controller_1.forgot);
    // TODO: Re-enable this feature
    app.route('/api/auth/reset/:token')
        .get(users_password_controller_1.validateResetToken)
        .post(users_password_controller_1.reset);
    // Setting up the users authentication api
    app.route('/api/auth/signup')
        .post(users_controller_1.signup);
    app.route('/api/auth/signin')
        .post(users_controller_1.signin);
    app.route('/api/auth/signout')
        .get(users_controller_1.signout);
    // Setting the oauth routes
    // TODO: Re-enable this feature
    // app.route('/api/auth/:strategy').get(users.oauthCall);
    // app.route('/api/auth/:strategy/callback').get(users.oauthCallback);
}
exports.default = default_1;
;
//# sourceMappingURL=auth.routes.js.map