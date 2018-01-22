import {signin, signout, signup} from '../controllers/users.controller';
import {forgot} from '../controllers/users/users.password.controller';

/**
 * Module dependencies
 */

export default function (app) {
  // Setting up the users password api
  app.route('/api/auth/forgot').post(forgot);
  // TODO: Re-enable this feature
  // app.route('/api/auth/reset/:token')
  //   .get(users.validateResetToken)
  //   .post(users.reset);

  // Setting up the users authentication api
  app.route('/api/auth/signup')
    .post(signup);

  app.route('/api/auth/signin')
    .post(signin);

  app.route('/api/auth/signout')
    .get(signout);

  // Setting the oauth routes
  // TODO: Re-enable this feature
  // app.route('/api/auth/:strategy').get(users.oauthCall);
  // app.route('/api/auth/:strategy/callback').get(users.oauthCallback);

};
