import {use as passportUse} from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {User} from '../../models/user.model';
import {getManager} from 'typeorm';

let userRepository = getManager().getRepository(User);
module.exports = function () {
  // Use local strategy
  passportUse(new LocalStrategy({
      usernameField: 'usernameOrEmail',
      passwordField: 'password'
    },
    function (usernameOrEmail, password, done) {

      userRepository
        .createQueryBuilder('user')
        .where('user.username = :username OR user.email = :email', {
          username: usernameOrEmail.toLowerCase(),
          email: usernameOrEmail.toLowerCase()
        })
        .getOne().then((user) => {
          if (!user || !user.authenticate(password)) {
            return done(null, false, {
              message: 'Invalid username or password (' + (new Date()).toLocaleTimeString() + ')'
            });
          } else {
            return done(null, user);
          }
        }, (err) => {
          return done(err);
        });
    }
  ));
};
