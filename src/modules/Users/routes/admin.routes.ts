// var adminPolicy = require('../policies/admin.server.policy'),
//   admin = require('../controllers/admin.server.controller');
import * as admin from '../controllers/admin.controller';

export default function (app) {
  // // User route registration first. Ref: #713
  // require('./users.server.routes.js')(app);

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
