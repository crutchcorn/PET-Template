// import {isAllowed} from '../policies/users.policy';
import {signup, signin, signout} from '../controllers/users.controller';
import * as passport from 'passport';

export default function (app) {
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // process the login form
  app.route('/login')
    .post(signin);
};
