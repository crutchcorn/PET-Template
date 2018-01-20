// var adminPolicy = require('../policies/admin.server.policy'),
//   admin = require('../controllers/admin.server.controller');
import * as admin from '../controllers/admin.controller';
import {me} from '../controllers/users.controller';
import {isAllowed} from '../policies/admin.server.policy';

export default function (app) {
  // User route registration first. Ref: meanjs/mean/#713
  app.route('/api/users/me')
    .get(isAllowed, me);


  // Users collection routes
  app.route('/api/users')
    .get(isAllowed, admin.list);

  // Single user routes
  app.route('/api/users/:userId')
    .get(isAllowed, admin.read)
    .put(isAllowed, admin.update)
    .delete(isAllowed, admin.deleteUser);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
