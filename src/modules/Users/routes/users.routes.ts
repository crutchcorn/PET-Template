// import {isAllowed} from '../policies/users.policy';
import {signup, signin, signout, me} from '../controllers/users.controller';
import {roleSaveAction, roleGetAllAction} from '../controllers/roles.controller';

export default function (app) {
  app.route('/api/auth/signup')
    .post(signup);

  app.route('/api/auth/signin')
    .post(signin);

  app.route('/api/auth/signout')
    .get(signout);

  app.route('/api/auth/me')
    .get(me);

  app.route('/role')
    .post(roleSaveAction)
    .get(roleGetAllAction);
};
