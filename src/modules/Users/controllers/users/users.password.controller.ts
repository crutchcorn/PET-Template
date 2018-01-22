import {resolve as pathResolve} from 'path';
import {createTransport} from 'nodemailer';
import {randomBytes} from 'crypto';
import {configReturn} from '../../../../config/config';
import {getManager} from 'typeorm';
import {renderFile} from 'ejs';
import {User} from '../../models/user.model';
import {Request, Response} from 'express';
const config: configReturn = require(pathResolve('./src/config/config'));
const smtpTransport = createTransport(config.mailer.options);
const userRepository = getManager().getRepository(User);

/**
 * Forgot for reset password (forgot POST)
 */
export function forgot(req: Request, res: Response) {
  const generateToken = new Promise(((resolve, reject) => {
    randomBytes(20, function (err, buffer) {
      const token = buffer.toString('hex');
      err ? reject({code: 500, message: err}) : resolve(token);
    });
  }));

  const findUser = (token: string) => new Promise((resolve, reject) => {
    if (req.body.usernameOrEmail) {
      const usernameOrEmail = String(req.body.usernameOrEmail).toLowerCase();

      userRepository
      .createQueryBuilder('user')
        .where('user.username = :username OR user.email = :email', {
          username: usernameOrEmail.toLowerCase(),
          email: usernameOrEmail.toLowerCase()
        })
        .getOne()
        .then(async user => {
          if (user.provider !== 'local') {
            reject({code: 400, message: 'It seems like you signed up using your ' + user.provider + ' account, please sign in using that provider.'});
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

            await userRepository.save(user);

            resolve({user: user, token: token});
          }
        })
        .catch(err => reject({code: 400, message: 'No account with that username or email has been found'}));
      } else {
      reject({code: 422, message: 'Username/email field must not be blank'})
    }
  });

  const generateHTML = (userTokenObj: {user: User, token: string}) => new Promise(async (resolve, reject) => {
    let httpTransport = 'http://';
    if ((<any>config).secure && (<any>config).secure.ssl === true) {
      httpTransport = 'https://';
    }
    const baseUrl = config.domain || httpTransport + req.headers.host;
    // TODO: The following will fail as there is no rendering engine set for the server
    // This is done intentionally, to prevent developers from using the server as a place to
    // host their templates or anything

    // TODO: Change this to use EJS
    const emailHTML = await renderFile(pathResolve('./src/modules/users/templates/reset-password-email.html'), {
      name: userTokenObj.user.displayName,
      appName: config.app.title,
      url: baseUrl + '/api/auth/reset/' + userTokenObj.token
    }, (err, str) => err ? reject({code: 500, message: err}) : resolve({html: str, ...userTokenObj}));
  });

  const sendEmail = (htmlUserObj: {user: User, token: string, html: string}) => new Promise((resolve, reject) => {
    const mailOptions = {
      to: htmlUserObj.user.email,
      from: config.mailer.from,
      subject: 'Password Reset',
      html: htmlUserObj.html
    };
    smtpTransport.sendMail(mailOptions, function (err) {
      err ? reject({code: 400, message: 'Failure sending email'}) :
        resolve('An email has been sent to the provided email with further instructions.')
    });
  });

  generateToken
    .then(findUser)
    .then(generateHTML)
    .then(sendEmail)
    .then(message => {
      res.send({message: message});
    })
    .catch((err: {message: string, code: number}) => res.status(err && err.code ? err.code : 500).send({
      message: err.message
    }));
}

/**
 * Reset password GET from email token
 */
// TODO: Re-enable this feature
// exports.validateResetToken = function (req, res) {
//   User.findOne({
//     resetPasswordToken: req.params.token,
//     resetPasswordExpires: {
//       $gt: Date.now()
//     }
//   }, function (err, user) {
//     if (err || !user) {
//       return res.redirect('/password/reset/invalid');
//     }
//
//     res.redirect('/password/reset/' + req.params.token);
//   });
// };

/**
 * Reset password POST from email token
 */
// exports.reset = function (req, res, next) {
//   // Init Variables
//   var passwordDetails = req.body;
//
//   async.waterfall([
//
//     function (done) {
//       User.findOne({
//         resetPasswordToken: req.params.token,
//         resetPasswordExpires: {
//           $gt: Date.now()
//         }
//       }, function (err, user) {
//         if (!err && user) {
//           if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
//             user.password = passwordDetails.newPassword;
//             user.resetPasswordToken = undefined;
//             user.resetPasswordExpires = undefined;
//
//             user.save(function (err) {
//               if (err) {
//                 return res.status(422).send({
//                   message: errorHandler.getErrorMessage(err)
//                 });
//               } else {
//                 req.login(user, function (err) {
//                   if (err) {
//                     res.status(400).send(err);
//                   } else {
//                     // Remove sensitive data before return authenticated user
//                     user.password = undefined;
//                     user.salt = undefined;
//
//                     res.json(user);
//
//                     done(err, user);
//                   }
//                 });
//               }
//             });
//           } else {
//             return res.status(422).send({
//               message: 'Passwords do not match'
//             });
//           }
//         } else {
//           return res.status(400).send({
//             message: 'Password reset token is invalid or has expired.'
//           });
//         }
//       });
//     },
//     function (user, done) {
//       res.render('modules/users/server/templates/reset-password-confirm-email', {
//         name: user.displayName,
//         appName: config.app.title
//       }, function (err, emailHTML) {
//         done(err, emailHTML, user);
//       });
//     },
//     // If valid email, send reset email using service
//     function (emailHTML, user, done) {
//       var mailOptions = {
//         to: user.email,
//         from: config.mailer.from,
//         subject: 'Your password has been changed',
//         html: emailHTML
//       };
//
//       smtpTransport.sendMail(mailOptions, function (err) {
//         done(err, 'done');
//       });
//     }
//   ], function (err) {
//     if (err) {
//       return next(err);
//     }
//   });
// };

/**
 * Change Password
 */
// exports.changePassword = function (req, res, next) {
//   // Init Variables
//   var passwordDetails = req.body;
//
//   if (req.user) {
//     if (passwordDetails.newPassword) {
//       User.findById(req.user.id, function (err, user) {
//         if (!err && user) {
//           if (user.authenticate(passwordDetails.currentPassword)) {
//             if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
//               user.password = passwordDetails.newPassword;
//
//               user.save(function (err) {
//                 if (err) {
//                   return res.status(422).send({
//                     message: errorHandler.getErrorMessage(err)
//                   });
//                 } else {
//                   req.login(user, function (err) {
//                     if (err) {
//                       res.status(400).send(err);
//                     } else {
//                       res.send({
//                         message: 'Password changed successfully'
//                       });
//                     }
//                   });
//                 }
//               });
//             } else {
//               res.status(422).send({
//                 message: 'Passwords do not match'
//               });
//             }
//           } else {
//             res.status(422).send({
//               message: 'Current password is incorrect'
//             });
//           }
//         } else {
//           res.status(400).send({
//             message: 'User is not found'
//           });
//         }
//       });
//     } else {
//       res.status(422).send({
//         message: 'Please provide a new password'
//       });
//     }
//   } else {
//     res.status(401).send({
//       message: 'User is not signed in'
//     });
//   }
// };
