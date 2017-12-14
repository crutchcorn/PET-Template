import {User} from '../models/user.model';
import {Strategy as LocalStrategy} from 'passport-local';
import {getManager} from 'typeorm';
import * as passport from 'passport';

export function signin(req, res, next) {
  passport.authenticate('local-login', (err, user, info) => {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      req.login(user, function (err) {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next)
};

export function signup(req, res, next) {
  passport.authenticate('local-signup', (err, user, info) => {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      req.login(user, function (err) {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next);
};


export function signout(req, res) {
  req.logout();
  res.json('Logged out');
};

export function getUser(req, res) {
  res.json(req.user);
}