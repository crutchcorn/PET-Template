import {use as passportUse} from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {User} from '../../models/user.model';
import {getManager} from 'typeorm';

let userRepository = getManager().getRepository(User);
export default function () {
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
        .addSelect('user.password')
        .getOne().then((user) => {
          if (!user || !user.authenticate(password)) {
            done(null, false, {
              message: 'Invalid username or password (' + (new Date()).toLocaleTimeString() + ')'
            });
          } else {
            done(null, user);
          }
        }).catch(err => done(null, false, {
        message: "An error occured when trying to signin"
      }));
    }
  ));
};
