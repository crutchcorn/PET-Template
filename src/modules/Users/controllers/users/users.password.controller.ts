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

            try {
              await userRepository.save(user);
              res.send({token: token});
              resolve({user: user, token: token});
            } catch (err) {
              res.status(500).send({message: "There was an error trying to find the token"});
              reject(err)
            }
          }
        })
        .catch(err => reject({code: 400, message: 'No account with that username or email has been found'}));
    } else {
      reject({code: 422, message: 'Username/email field must not be blank'})
    }
  });

  const generateHTML = (userTokenObj: {user: User, token: string}) => new Promise((resolve, reject) => {
    let httpTransport = 'http://';
    if ((<any>config).secure && (<any>config).secure.ssl === true) {
      httpTransport = 'https://';
    }
    const baseUrl = config.domain || httpTransport + req.headers.host;

    renderFile(pathResolve('./src/modules/users/templates/reset-password-email.html'), {
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
      err ? reject({code: 400, message: 'Failure sending email'}) : // TODO: Change from throwing a reject to sending an error to an error logger
        resolve('An email has been sent to the provided email with further instructions.')
    });
  });

  generateToken
    .then(findUser)
    .then(generateHTML)
    // .then(sendEmail)
    .catch((err: {message: string, code: number}) => res.status(err && err.code ? err.code : 500).send({
      message: err.message
    }));
}

/**
 * Reset password GET from email token
 */
export function validateResetToken(req, res) {
  userRepository
    .createQueryBuilder('row')
    .where('row.resetPasswordToken = :token', {token: req.params.token})
    .getOne()
    .then(user => {
      user.resetPasswordExpires > new Date(Date.now()) ? res.send({token: req.params.token}) :
        res.status(401).send({message: "Token has expired"})
    })
    .catch(err => {res.status(404).send({message: "Token is invalid"})});
};

/**
 * Reset password POST from email token
 */
export function reset(req: Request, res: Response) {
  // Init Variables
  const passwordDetails = req.body;

  const findUser = new Promise((resolve, reject) => {
    userRepository
      .createQueryBuilder('row')
      .where('row.resetPasswordToken = :token', {token: req.params.token})
      .addSelect('row.password')
      .addSelect('row.salt')
      .getOne()
      .then(user => {
        console.log(JSON.stringify(user));
        user.resetPasswordExpires > new Date(Date.now()) ? resolve(user) :
          reject({code: 401, message: 'Password reset token has expired.'})
      })
      .catch(err => reject({code: 401, message: 'Password reset token is invalid.'}));
  });

  const changeUserPass = (user: User) => new Promise((resolve, reject) => {
    if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
      user.password = passwordDetails.newPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      console.log(JSON.stringify(user));

      userRepository.save(user)
        .then(userSaved => {
          req.login(user, function (err) {
            if (err) {
              reject({code: 400, message: err});
            } else {
              // Remove sensitive data before return authenticated user
              user.password = undefined;

              res.json(user);

              resolve(user);
            }
          });
        })
        .catch(err => reject({code: 500, message: err}));
    } else {
      reject({code: 422, message: 'Passwords do not match'});
    }
  });

  const generateHTML = (user: User) => new Promise((resolve, reject) => {
    renderFile(pathResolve('./src/modules/users/templates/reset-password-confirm-email.html'), {
      name: user.displayName,
      appName: config.app.title,
    }, (err, str) => err ? reject({code: 500, message: err}) : resolve({html: str, user: User}));
  });

  const sendEmail = (userHTMLObj: {html: string, user: User}) => new Promise((resolve, reject) => {
    const mailOptions = {
      to: userHTMLObj.user.email,
      from: config.mailer.from,
      subject: 'Your password has been changed',
      html: userHTMLObj.html
    };

    smtpTransport.sendMail(mailOptions, function (err) {
      err ? reject(err) : resolve("Job well done")
    });
  });

  findUser
    .then(changeUserPass)
    .then(generateHTML)
    // .then(sendEmail)
    .catch((err: {message: string, code: number}) => res.status(err && err.code ? err.code : 500).send({
      message: err.message
    }));
};

/**
 * Change Password
 */
// TODO: Re-enable this feature
export function changePassword(req, res) {
  // Init Variables
  const passwordDetails = req.body;

  if (req.user) {
    if (passwordDetails.newPassword) {
      userRepository.findOneById(req.user.id)
        .then(user => {
          if (user.authenticate(passwordDetails.currentPassword)) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.password = passwordDetails.newPassword;
              userRepository.save(user)
                .then(userSaved => {
                  req.login(user, function (err) {
                    if (err) {
                      res.status(400).send(err);
                    } else {
                      res.send({
                        message: 'Password changed successfully'
                      });
                    }
                  });
                })
                .catch(err => res.status(422).send({
                  message: err
                }));
            } else {
              res.status(422).send({
                message: 'Passwords do not match'
              });
            }
          } else {
            res.status(422).send({
              message: 'Current password is incorrect'
            });
          }
        })
        .catch(err => res.status(400).send({
          message: 'User is not found'
        }));
    } else {
      res.status(422).send({
        message: 'Please provide a new password'
      });
    }
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};
