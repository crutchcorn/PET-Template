"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// var adminPolicy = require('../policies/admin.server.policy'),
//   admin = require('../controllers/admin.server.controller');
const users_controller_1 = require("../controllers/users.controller");
const admin_server_policy_1 = require("../policies/admin.server.policy");
const admin_controller_1 = require("../controllers/admin.controller");
function default_1(app) {
    // User route registration first. Ref: meanjs/mean/#713
    app.route('/api/users/me')
        .get(admin_server_policy_1.isAllowed, users_controller_1.me);
    // Users collection routes
    app.route('/api/users')
        .get(admin_server_policy_1.isAllowed, admin_controller_1.list);
    // Single user routes
    app.route('/api/users/:userId')
        .get(admin_server_policy_1.isAllowed, admin_controller_1.read)
        .put(admin_server_policy_1.isAllowed, admin_controller_1.update)
        .delete(admin_server_policy_1.isAllowed, admin_controller_1.deleteUser);
    // Finish by binding the user middleware
    app.param('userId', admin_controller_1.userByID);
}
exports.default = default_1;
;
//# sourceMappingURL=admin.routes.js.map