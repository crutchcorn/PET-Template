// import {isAllowed} from '../policies/users.policy';
import {update} from '../controllers/users/users.profile.controller';
import {changePassword} from '../controllers/users/users.password.controller';

export default function (app) {
  app.route('/api/users')
    .put(update);

  // TODO: Re-enable this feature
  // app.route('/api/users/accounts')
  //   .delete(users.removeOAuthProvider);
  app.route('/api/users/password')
    .post(changePassword);
  // app.route('/api/users/picture')
  //   .post(users.changeProfilePicture);
};
