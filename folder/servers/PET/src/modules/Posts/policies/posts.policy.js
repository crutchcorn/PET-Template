"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Acl = require("acl");
// Using the memory backend
let acl = new Acl(new Acl.memoryBackend());
/**
 * Invoke System logs Permissions
 */
function invokeRolesPolicies() {
    acl.allow([{
            roles: ['guest'],
            allows: [{
                    resources: '/api/posts',
                    permissions: '*'
                }, {
                    resources: '/api/posts/:id',
                    permissions: '*'
                }]
        }]);
}
exports.invokeRolesPolicies = invokeRolesPolicies;
;
/**
 * Check If System logs Policy Allows
 */
function isAllowed(req, res, next) {
    const roles = (req.user) ? req.user.roles.map(role => role.name) : ['guest'];
    console.log(roles);
    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
        if (err) {
            // An authorization error occurred
            return res.status(500).send('Unexpected authorization error');
        }
        else {
            if (isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            }
            else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
}
exports.isAllowed = isAllowed;
;
//# sourceMappingURL=posts.policy.js.map