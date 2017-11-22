// import {isAllowed} from '../policies/users.policy';
import {signup, signin, signout} from '../controllers/users.controller';
import * as passport from 'passport';

export default function (app) {
  app.route('/signup')
    .post(signup);

  // process the login form
  app.route('/login')
    .post(signin);

  app.route('/logout')
    .get(signout);
};
