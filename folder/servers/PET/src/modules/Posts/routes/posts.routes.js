"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const posts_policy_1 = require("../policies/posts.policy");
const posts_controller_1 = require("../controllers/posts.controller");
function default_1(app) {
    app.route('/api/posts').all(posts_policy_1.isAllowed, posts_controller_1.setDb)
        .get(posts_policy_1.isAllowed, posts_controller_1.postGetAllAction)
        .post(posts_policy_1.isAllowed, posts_controller_1.postSaveAction);
    app.route('/api/posts/:id').all(posts_policy_1.isAllowed, posts_controller_1.setDb)
        .get(posts_policy_1.isAllowed, posts_controller_1.postGetByIdAction);
    app.param('id', posts_controller_1.postByID);
}
exports.default = default_1;
;
//# sourceMappingURL=posts.routes.js.map