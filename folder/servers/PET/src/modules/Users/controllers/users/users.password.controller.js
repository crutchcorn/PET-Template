"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const nodemailer_1 = require("nodemailer");
const crypto_1 = require("crypto");
const typeorm_1 = require("typeorm");
const ejs_1 = require("ejs");
const user_model_1 = require("../../models/user.model");
const config = require(path_1.resolve('./src/config/config'));
const smtpTransport = nodemailer_1.createTransport(config.mailer.options);
const userRepository = typeorm_1.getManager().getRepository(user_model_1.User);
/**
 * Forgot for reset password (forgot POST)
 */
function forgot(req, res) {
    const generateToken = new Promise(((resolve, reject) => {
        crypto_1.randomBytes(20, function (err, buffer) {
            const token = buffer.toString('hex');
            err ? reject({ code: 500, message: err }) : resolve(token);
        });
    }));
    const findUser = (token) => new Promise((resolve, reject) => {
        if (req.body.usernameOrEmail) {
            const usernameOrEmail = String(req.body.usernameOrEmail).toLowerCase();
            userRepository
                .createQueryBuilder('user')
                .where('user.username = :username OR user.email = :email', {
                username: usernameOrEmail.toLowerCase(),
                email: usernameOrEmail.toLowerCase()
            })
                .getOne()
                .then((user) => __awaiter(this, void 0, void 0, function* () {
                if (user.provider !== 'local') {
                    reject({ code: 400, message: 'It seems like you signed up using your ' + user.provider + ' account, please sign in using that provider.' });
                }
                else {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
                    yield userRepository.save(user);
                    res.send({ token: token });
                    resolve({ user: user, token: token });
                }
            }))
                .catch(err => reject({ code: 400, message: 'No account with that username or email has been found' }));
        }
        else {
            reject({ code: 422, message: 'Username/email field must not be blank' });
        }
    });
    const generateHTML = (userTokenObj) => new Promise((resolve, reject) => {
        let httpTransport = 'http://';
        if (config.secure && config.secure.ssl === true) {
            httpTransport = 'https://';
        }
        const baseUrl = config.domain || httpTransport + req.headers.host;
        ejs_1.renderFile(path_1.resolve('./src/modules/users/templates/reset-password-email.html'), {
            name: userTokenObj.user.displayName,
            appName: config.app.title,
            url: baseUrl + '/api/auth/reset/' + userTokenObj.token
        }, (err, str) => err ? reject({ code: 500, message: err }) : resolve(Object.assign({ html: str }, userTokenObj)));
    });
    const sendEmail = (htmlUserObj) => new Promise((resolve, reject) => {
        const mailOptions = {
            to: htmlUserObj.user.email,
            from: config.mailer.from,
            subject: 'Password Reset',
            html: htmlUserObj.html
        };
        smtpTransport.sendMail(mailOptions, function (err) {
            err ? reject({ code: 400, message: 'Failure sending email' }) : // TODO: Change from throwing a reject to sending an error to an error logger
                resolve('An email has been sent to the provided email with further instructions.');
        });
    });
    generateToken
        .then(findUser)
        .then(generateHTML)
        .catch((err) => res.status(err && err.code ? err.code : 500).send({
        message: err.message
    }));
}
exports.forgot = forgot;
/**
 * Reset password GET from email token
 */
function validateResetToken(req, res) {
    userRepository
        .createQueryBuilder('row')
        .where('row.resetPasswordToken = :token', { token: req.params.token })
        .getOne()
        .then(user => {
        user.resetPasswordExpires > new Date(Date.now()) ? res.send({ token: req.params.token }) :
            res.status(401).send({ message: "Token has expired" });
    })
        .catch(err => { res.status(404).send({ message: "Token is invalid" }); });
}
exports.validateResetToken = validateResetToken;
;
/**
 * Reset password POST from email token
 */
function reset(req, res) {
    // Init Variables
    const passwordDetails = req.body;
    const findUser = new Promise((resolve, reject) => {
        userRepository
            .createQueryBuilder('row')
            .where('row.resetPasswordToken = :token', { token: req.params.token })
            .addSelect('row.password')
            .addSelect('row.salt')
            .getOne()
            .then(user => {
            console.log(JSON.stringify(user));
            user.resetPasswordExpires > new Date(Date.now()) ? resolve(user) :
                reject({ code: 401, message: 'Password reset token has expired.' });
        })
            .catch(err => reject({ code: 401, message: 'Password reset token is invalid.' }));
    });
    const changeUserPass = (user) => new Promise((resolve, reject) => {
        if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
            user.password = passwordDetails.newPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            console.log(JSON.stringify(user));
            userRepository.save(user)
                .then(userSaved => {
                req.login(user, function (err) {
                    if (err) {
                        reject({ code: 400, message: err });
                    }
                    else {
                        // Remove sensitive data before return authenticated user
                        user.password = undefined;
                        res.json(user);
                        resolve(user);
                    }
                });
            })
                .catch(err => reject({ code: 500, message: err }));
        }
        else {
            reject({ code: 422, message: 'Passwords do not match' });
        }
    });
    const generateHTML = (user) => new Promise((resolve, reject) => {
        ejs_1.renderFile(path_1.resolve('./src/modules/users/templates/reset-password-confirm-email.html'), {
            name: user.displayName,
            appName: config.app.title,
        }, (err, str) => err ? reject({ code: 500, message: err }) : resolve({ html: str, user: user_model_1.User }));
    });
    const sendEmail = (userHTMLObj) => new Promise((resolve, reject) => {
        const mailOptions = {
            to: userHTMLObj.user.email,
            from: config.mailer.from,
            subject: 'Your password has been changed',
            html: userHTMLObj.html
        };
        smtpTransport.sendMail(mailOptions, function (err) {
            err ? reject(err) : resolve("Job well done");
        });
    });
    findUser
        .then(changeUserPass)
        .then(generateHTML)
        .catch((err) => res.status(err && err.code ? err.code : 500).send({
        message: err.message
    }));
}
exports.reset = reset;
;
/**
 * Change Password
 */
// TODO: Re-enable this feature
function changePassword(req, res) {
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
                                }
                                else {
                                    res.send({
                                        message: 'Password changed successfully'
                                    });
                                }
                            });
                        })
                            .catch(err => res.status(422).send({
                            message: err
                        }));
                    }
                    else {
                        res.status(422).send({
                            message: 'Passwords do not match'
                        });
                    }
                }
                else {
                    res.status(422).send({
                        message: 'Current password is incorrect'
                    });
                }
            })
                .catch(err => res.status(400).send({
                message: 'User is not found'
            }));
        }
        else {
            res.status(422).send({
                message: 'Please provide a new password'
            });
        }
    }
    else {
        res.status(401).send({
            message: 'User is not signed in'
        });
    }
}
exports.changePassword = changePassword;
;
//# sourceMappingURL=users.password.controller.js.map