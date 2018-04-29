import {NextFunction, Request, Response} from 'express';
import * as path from 'path';
import * as passport from 'passport';
import {getManager} from 'typeorm';
import {User} from '../../models/user.model';
import {Role} from '../../models/role.model';
import {configReturn} from '../../../../config/config';
const config: configReturn = require(path.resolve('./src/config/config'));
import * as validator from 'validator';
// errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),

// URLs for which user can't be redirected on signin
var noReturnUrls = [
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
    {displayName: `${req.body.firstName} ${req.body.lastName}`
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
    res.status(500).send({message: "There was a problem signing up that user", err: err});
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
  var strategy = req.params.strategy;
  // Authenticate
  passport.authenticate(strategy)(req, res, next);
};

/**
 * OAuth callback
 */
export function oauthCallback(req: Request, res: Response, next: NextFunction) {
  const strategy = req.params.strategy;

  // info.redirect_to contains inteded redirect path
  passport.authenticate(strategy, function (err, user, info) {
    if (err) {
      return res.redirect('/authentication/signin?err=');
      // return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
    }
    if (!user) {
      return res.redirect('/authentication/signin');
    }
    req.login(user, function (err) {
      if (err) {
        return res.redirect('/authentication/signin');
      }

      return res.redirect(info.redirect_to || '/');
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
// TODO: Re-enable this feature
// export function saveOAuthUserProfile(req, providerUserProfile, done) {
//   // Setup info and user objects
//   var info = {};
//   var user;
//
//   // Set redirection path on session.
//   // Do not redirect to a signin or signup page
//   if (noReturnUrls.indexOf(req.session.redirect_to) === -1) {
//     info.redirect_to = req.session.redirect_to;
//   }
//
//   // Define a search query fields
//   var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
//   var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;
//
//   // Define main provider search query
//   var mainProviderSearchQuery = {};
//   mainProviderSearchQuery.provider = providerUserProfile.provider;
//   mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];
//
//   // Define additional provider search query
//   var additionalProviderSearchQuery = {};
//   additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];
//
//   // Define a search query to find existing user with current provider profile
//   var searchQuery = {
//     $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
//   };
//
//   // Find existing user with this provider account
//   User.findOne(searchQuery, function (err, existingUser) {
//     if (err) {
//       return done(err);
//     }
//
//     if (!req.user) {
//       if (!existingUser) {
//         var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
//
//         User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
//           user = new User({
//             firstName: providerUserProfile.firstName,
//             lastName: providerUserProfile.lastName,
//             username: availableUsername,
//             displayName: providerUserProfile.displayName,
//             profileImageURL: providerUserProfile.profileImageURL,
//             provider: providerUserProfile.provider,
//             providerData: providerUserProfile.providerData
//           });
//
//           // Email intentionally added later to allow defaults (sparse settings) to be applid.
//           // Handles case where no email is supplied.
//           // See comment: https://github.com/meanjs/mean/pull/1495#issuecomment-246090193
//           user.email = providerUserProfile.email;
//
//           // And save the user
//           user.save(function (err) {
//             return done(err, user, info);
//           });
//         });
//       } else {
//         return done(err, existingUser, info);
//       }
//     } else {
//       // User is already logged in, join the provider data to the existing user
//       user = req.user;
//
//       // Check if an existing user was found for this provider account
//       if (existingUser) {
//         if (user.id !== existingUser.id) {
//           return done(new Error('Account is already connected to another user'), user, info);
//         }
//
//         return done(new Error('User is already connected using this provider'), user, info);
//       }
//
//       // Add the provider data to the additional provider data field
//       if (!user.additionalProvidersData) {
//         user.additionalProvidersData = {};
//       }
//
//       user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;
//
//       // Then tell mongoose that we've updated the additionalProvidersData field
//       user.markModified('additionalProvidersData');
//
//       // And save the user
//       user.save(function (err) {
//         return done(err, user, info);
//       });
//     }
//   });
// };

/**
 * Remove OAuth provider
 */
// export function removeOAuthProvider(req, res, next) {
//   var user = req.user;
//   var provider = req.query.provider;
//
//   if (!user) {
//     return res.status(401).json({
//       message: 'User is not authenticated'
//     });
//   } else if (!provider) {
//     return res.status(400).send();
//   }
//
//   // Delete the additional provider
//   if (user.additionalProvidersData[provider]) {
//     delete user.additionalProvidersData[provider];
//
//     // Then tell mongoose that we've updated the additionalProvidersData field
//     user.markModified('additionalProvidersData');
//   }
//
//   user.save(function (err) {
//     if (err) {
//       return res.status(422).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       req.login(user, function (err) {
//         if (err) {
//           return res.status(400).send(err);
//         } else {
//           return res.json(user);
//         }
//       });
//     }
//   });
// };
