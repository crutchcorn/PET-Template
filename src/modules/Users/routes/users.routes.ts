// import {isAllowed} from '../policies/users.policy';
import {roleSaveAction, roleGetAllAction} from '../controllers/roles.controller';
import {update} from '../controllers/users/users.profile.server.controller';

export default function (app) {
  app.route('/api/users')
    .put(update);

  // TODO: Re-enable this feature
  // app.route('/api/users/accounts')
  //   .delete(users.removeOAuthProvider);
  // app.route('/api/users/password')
  //   .post(changePassword);
  // app.route('/api/users/picture')
  //   .post(users.changeProfilePicture);
};
