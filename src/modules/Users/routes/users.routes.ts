// import {isAllowed} from '../policies/users.policy';
import {signup, signin, signout, getUser} from '../controllers/users.controller';
import {roleSaveAction, roleGetAllAction} from '../controllers/roles.controller';

export default function (app) {
  app.route('/api/auth/signup')
    .post(signup);

  app.route('/api/auth/login')
    .post(signin);

  app.route('/api/auth/logout')
    .post(signout);

  app.route('/test')
    .get(getUser);

  app.route('/role')
    .post(roleSaveAction)
    .get(roleGetAllAction);
};
