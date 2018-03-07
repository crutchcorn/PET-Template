// var adminPolicy = require('../policies/admin.server.policy'),
//   admin = require('../controllers/admin.server.controller');
import {me} from '../controllers/users.controller';
import {isAllowed} from '../policies/admin.server.policy';
import {deleteUser, list, read, update, userByID} from '../controllers/admin.controller';

export default function (app) {
  // User route registration first. Ref: meanjs/mean/#713
  app.route('/api/users/me')
    .get(isAllowed, me);

  // Users collection routes
  app.route('/api/users')
    .get(isAllowed, list);

  // Single user routes
  app.route('/api/users/:userId')
    .get(isAllowed, read)
    .put(isAllowed, update)
    .delete(isAllowed, deleteUser);

  // Finish by binding the user middleware
  app.param('userId', userByID);
};
