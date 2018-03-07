"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {isAllowed} from '../policies/users.policy';
const users_profile_server_controller_1 = require("../controllers/users/users.profile.server.controller");
const users_password_controller_1 = require("../controllers/users/users.password.controller");
function default_1(app) {
    app.route('/api/users')
        .put(users_profile_server_controller_1.update);
    // TODO: Re-enable this feature
    // app.route('/api/users/accounts')
    //   .delete(users.removeOAuthProvider);
    app.route('/api/users/password')
        .post(users_password_controller_1.changePassword);
    // app.route('/api/users/picture')
    //   .post(users.changeProfilePicture);
}
exports.default = default_1;
;
//# sourceMappingURL=users.routes.js.map