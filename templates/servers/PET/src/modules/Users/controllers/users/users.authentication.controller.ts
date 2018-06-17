// TODO: Fix `*` from imports
import {NextFunction, Request, Response} from 'express';
import * as path from 'path';
import * as passport from 'passport';
import {Brackets, createQueryBuilder, getManager} from 'typeorm';
import {User, findUniqueUsername} from '../../models/user.model';
import {Role} from '../../models/role.model';
import {configReturn} from '../../../../config/config';

const config: configReturn = require(path.resolve('./src/config/config'));
import * as validator from 'validator';
// errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),

// URLs for which user can't be redirected on signin
const noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

const userRepository = getManager().getRepository(User);

/**
 * Signup
 */
export async function signup(req: Request, res: Response) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  const role = new Role();
  role.name = 'user';

  // Init user and add missing fields
  let user = userRepository.create(Object.assign(
    req.body as User,
    {provider: 'local'},
    {roles: [role]},
    {
      displayName: `${req.body.firstName} ${req.body.lastName}`
    }));

  // Then save the user
  try {
    await userRepository.save(user);
    user.password = undefined;
    user.salt = undefined;

    req.login(user, function (err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.json(user);
      }
    });
  } catch (err) {
    // TODO: Catch errors with non-nullable
    res.status(500).send({message: 'There was a problem signing up that user', err: err});
  }

}

/**
 * Signin after passport authentication
 */
export function signin(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(422).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          if (req.body.remember) {
            req.session.cookie.maxAge = config.sessionCookie.rememberMaxAge;
          }
          res.json(user);
        }
      });
    }
  })(req, res, next);
}

/**
 * Signout
 */
export function signout(req: Request, res: Response) {
  req.logout();
  res.send({message: 'Logged out successfully'});
}

/**
 * OAuth provider call
 */
export function oauthCall(req: Request, res: Response, next: NextFunction) {
  const strategy = req.params.strategy;
  // Authenticate
  passport.authenticate(strategy)(req, res, next);
}

/**
 * OAuth callback
 */
export function oauthCallback(req: Request, res: Response, next: NextFunction) {
  const strategy = req.params.strategy;

  passport.authenticate(strategy, function (err, user, info) {
    if (err) {
      console.log(err);
      return res.status(500).send({message: 'There was an error authenticating'});
    }
    if (!user) {
      return res.status(404).send({message: 'There is no user with the matching info'});
    }
    req.login(user, function (err) {
      if (err) {
        return res.status(500).send({message: 'There was an error logging in'});
      }

      return res.send({message: 'User has been logged in'});
    });
  })(req, res, next);
}

export function me(req: Request, res: Response) {
  let safeUserObject = null;
  if (req.user) {
    safeUserObject = {
      displayName: validator.escape(req.user.displayName),
      provider: validator.escape(req.user.provider),
      username: validator.escape(req.user.username),
      created: req.user.created.toString(),
      roles: req.user.roles,
      profileImageURL: req.user.profileImageURL,
      email: validator.escape(req.user.email),
      lastName: validator.escape(req.user.lastName),
      firstName: validator.escape(req.user.firstName),
      additionalProvidersData: req.user.additionalProvidersData
    };
  }

  res.json(safeUserObject || null);
}

/**
 * Helper function to save or update a OAuth user profile
 */
export async function saveOAuthUserProfile(providerUserProfile: {
  firstName: string,
  lastName: string,
  displayName: string,
  email: string,
  username: string,
  profileImageURL: string,
  provider: string,
  providerIdentifierField: string,
  providerData: any
}, done: Function, req?: Request) {
  // Setup info and user objects
  let info: any = {};
  let user: any;

  // Find existing user with this provider account
  try {
    // Define main provider search query and additional provider search query
    // This is only for PostgreSQL - TODO: Add for MySQL/etc
    const existingUser = await
      userRepository
        .createQueryBuilder('user')
        .where(
          new Brackets(qb => {
            qb.where('user.providerData ->> :provField = :provData', {
              provField: providerUserProfile.providerIdentifierField,
              provData: providerUserProfile.providerData[providerUserProfile.providerIdentifierField]
            })
              .andWhere('provider = :provider', {
                provider: providerUserProfile.provider
              });
          })
        )
        .orWhere('user.additionalProvidersData ->:provider ->> :provIdentField = :provDataField', {
          provider: providerUserProfile.provider,
          provIdentField: providerUserProfile.providerIdentifierField,
          provDataField: providerUserProfile.providerData[providerUserProfile.providerIdentifierField]
        })
        .getOne();

    // Req is not defined because we're not passing req via the GH callback
    if (!req || !req.user) {
      // TypeORM query returns an array
      if (!existingUser) {
        const possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

        // TOOD: Enable this again
        const availableUsername = await findUniqueUsername(possibleUsername);
        user = userRepository.create({
          firstName: providerUserProfile.firstName,
          lastName: providerUserProfile.lastName,
          username: availableUsername,
          displayName: providerUserProfile.displayName,
          profileImageURL: providerUserProfile.profileImageURL,
          provider: providerUserProfile.provider,
          providerData: providerUserProfile.providerData,
          // Email used to be added later to allow defaults (sparse settings) to be applied when MEANJS was still the base.
          // See comment: https://github.com/meanjs/mean/pull/1495#issuecomment-246090193
          email: providerUserProfile.email
        });

        // And save the user
        await userRepository.save(user);
        return done(null, user, info);
      } else {
        // User is attempting to login through the provider
        return done(null, existingUser, info);
      }
    } else {
      // User is already logged in, join the provider data to the existing user
      user = req.user;

      // Check if an existing user was found for this provider account
      if (existingUser) {
        if (user.id !== existingUser.id) {
          return done(new Error('Account is already connected to another user'), user, info);
        }

        return done(new Error('User is already connected using this provider'), user, info);
      }

      user.additionalProvidersData = {
        [providerUserProfile.provider]: providerUserProfile.providerData,
        // Add the provider data to the additional provider data field
        ...(user.additionalProvidersData ? user.additionalProvidersData : {})
      };

      await userRepository.save(user);
      return done(null, user, info);
    }
  } catch (err) {
    return done(err, user, info);
  }
}

/**
 * Remove OAuth provider
 */
export async function removeOAuthProvider(req, res, next) {
  try {
    let user = req.user;
    const provider = req.query.provider;

    if (!user) {
      return res.status(401).json({
        message: 'User is not authenticated'
      });
    } else if (!provider) {
      return res.status(400).send();
    }

    // Delete the additional provider
    if (user.additionalProvidersData[provider]) {
      // Immutable version of this command
      user.additionalProvidersData = Object.keys(user.additionalProvidersData)
        .reduce((prev, key) => {
          return {
            ...prev,
            ...(key !== provider ? {[key]: user.additionalProvidersData[key]} : {})
          };
        }, {});
    }
    await userRepository.save(user);
    req.login(user, function (err) {
      if (err) {
        return res.status(400).send(err);
      } else {
        return res.json(user);
      }
    });
  } catch (err) {
    return res.status(422).send({
      message: err
    });
  }
}
