// var adminPolicy = require('../policies/admin.server.policy'),
//   admin = require('../controllers/admin.server.controller');
import * as admin from '../controllers/admin.controller';
import {me} from '../controllers/users.controller';

export default function (app) {
  // User route registration first. Ref: meanjs/mean/#713
  app.route('/api/users/me')
    .get(me);


  // Users collection routes
  app.route('/api/users')
    .get(admin.list);

  // Single user routes
  app.route('/api/users/:userId')
    .get(admin.read)
    .put(admin.update)
    .delete(admin.deleteUser);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
