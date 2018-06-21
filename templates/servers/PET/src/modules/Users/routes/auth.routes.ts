import {oauthCall, oauthCallback, signin, signout, signup} from '../controllers/users.controller';
import {forgot, validateResetToken, reset} from '../controllers/users/users.password.controller';

/**
 * Module dependencies
 */
export default function (app) {
  // Setting up the users password api
  app.route('/api/auth/forgot')
    .post(forgot);

  app.route('/api/auth/reset/:token')
    .get(validateResetToken)
    .post(reset);

  // Setting up the users authentication api
  app.route('/api/auth/signup')
    .post(signup);

  app.route('/api/auth/signin')
    .post(signin);

  app.route('/api/auth/signout')
    .get(signout);

  // Setting the oauth routes
  app.route('/api/auth/:strategy').get(oauthCall);
  app.route('/api/auth/:strategy/callback').get(oauthCallback);
};
