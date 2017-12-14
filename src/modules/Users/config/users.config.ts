import {User} from '../models/user.model';
import {Strategy as LocalStrategy} from 'passport-local';
import {getManager} from 'typeorm';
import * as passport from 'passport';

let userRepository = getManager().getRepository(User);
export default function (app) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    userRepository
      .createQueryBuilder('row')
      .select('row.id')
      .addSelect('row.email')
      .addSelect('row.password')
      .where('row.id = :id', {id: id})
      .getOne().then((user) => {
      done(null, user);
    }, (err) => {
      done(err, null);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {

      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function () {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        userRepository
          .createQueryBuilder('row')
          .where('row.email = :email', {email: email})
          .getOne().then((user) => {
          // check to see if theres already a user with that email
          if (user) {
            return done(null, false, {message: "That email is already taken"});
          } else {
            // if there is no user with that email
            // create the user
            var newUser = new User();

            // set the user's local credentials
            newUser.email = email;

            const userToSave = JSON.parse(JSON.stringify(newUser));
            newUser.password = newUser.generateHash(password);

            // save the user
            userRepository.save(newUser).then((user) => {
              return done(null, (<any>Object).assign(userToSave, {id: user.id}));
            }, (err) => {
              if (err) {
                return done(null, false, {message: err});
              }
            });
          }

        }, (err) => {          // if there are any errors, return the error
          if (err)
            return done(err);
        });

      });

    }));

  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password'
    },
    function(email, password, done) { // callback with email and password from our form

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      userRepository
        .createQueryBuilder('row')
        .addSelect('row.password')
        .where('row.email = :email', {email: email})
        .getOne().then((user) => {
        // if no user is found, return the message
        if (!user) {
          return done(null, false, {message: 'No user found.'}); // req.flash is the way to set flashdata using connect-flash
        }

        // if the user is found but the password is wrong
        if (!user.validPassword(password)) {
          return done(null, false, {message: 'Oops! Wrong password.'}); // create the loginMessage and save it to session as flashdata
        }

        // all is well, return successful user
        userRepository.findOne({ 'email' :  email }).then((user) => {
          return done(null, user);
        });
      }, (err) => {
        // if there are any errors, return the error before anything else
        return done(err);
      });

    }));

  // Add passport's middleware
  app.use(passport.initialize());
  app.use(passport.session());
}