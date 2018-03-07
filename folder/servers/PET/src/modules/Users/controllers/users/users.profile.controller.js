'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const user_model_1 = require("../../models/user.model");
const typeorm_1 = require("typeorm");
const config = require(path.resolve('./src/config/config'));
const validator_1 = require("validator");
/**
 * Module dependencies
 */
// var _ = require('lodash'),
// errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
// multer = require('multer'),
// multerS3 = require('multer-s3'),
// aws = require('aws-sdk'),
// amazonS3URI = require('amazon-s3-uri'),
// User = mongoose.model('User'),
// validator = require('validator');
const userRepository = typeorm_1.getManager().getRepository(user_model_1.User);
const whitelistedFields = ['firstName', 'lastName', 'email', 'username'];
function pick(o, ...props) {
    return Object.assign({}, ...props.map(prop => ({ [prop]: o[prop] })));
}
// var useS3Storage = config.uploads.storage === 's3' && config.aws.s3;
// var s3;
//
// if (useS3Storage) {
//   aws.config.update({
//     accessKeyId: config.aws.s3.accessKeyId,
//     secretAccessKey: config.aws.s3.secretAccessKey
//   });
//
//   s3 = new aws.S3();
// }
/**
 * Update user details
 */
function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Init Variables
        let user = req.user;
        if (user) {
            // Update whitelisted fields only
            user = Object.assign(user, pick(req.body, whitelistedFields));
            user.displayName = user.firstName + ' ' + user.lastName;
            user = yield userRepository.save(user);
            req.login(user, function (err) {
                if (err) {
                    res.status(400).send(err);
                }
                else {
                    res.json(user);
                }
            });
        }
        else {
            res.status(401).send({
                message: 'User is not signed in'
            });
        }
    });
}
exports.update = update;
;
/**
 * Update profile picture
 */
// TODO: Re-enable this feature
// exports.changeProfilePicture = function (req, res) {
//   var user = req.user;
//   var existingImageUrl;
//   var multerConfig;
//
//
//   if (useS3Storage) {
//     multerConfig = {
//       storage: multerS3({
//         s3: s3,
//         bucket: config.aws.s3.bucket,
//         acl: 'public-read'
//       })
//     };
//   } else {
//     multerConfig = config.uploads.profile.image;
//   }
//
//   // Filtering to upload only images
//   multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;
//
//   var upload = multer(multerConfig).single('newProfilePicture');
//
//   if (user) {
//     existingImageUrl = user.profileImageURL;
//     uploadImage()
//       .then(updateUser)
//       .then(deleteOldImage)
//       .then(login)
//       .then(function () {
//         res.json(user);
//       })
//       .catch(function (err) {
//         res.status(422).send(err);
//       });
//   } else {
//     res.status(401).send({
//       message: 'User is not signed in'
//     });
//   }
//
//   function uploadImage() {
//     return new Promise(function (resolve, reject) {
//       upload(req, res, function (uploadError) {
//         if (uploadError) {
//           reject(errorHandler.getErrorMessage(uploadError));
//         } else {
//           resolve();
//         }
//       });
//     });
//   }
//
//   function updateUser() {
//     return new Promise(function (resolve, reject) {
//       user.profileImageURL = config.uploads.storage === 's3' && config.aws.s3 ?
//         req.file.location :
//         '/' + req.file.path;
//       user.save(function (err, theuser) {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });
//   }
//
//   function deleteOldImage() {
//     return new Promise(function (resolve, reject) {
//       if (existingImageUrl !== User.schema.path('profileImageURL').defaultValue) {
//         if (useS3Storage) {
//           try {
//             var { region, bucket, key } = amazonS3URI(existingImageUrl);
//             var params = {
//               Bucket: config.aws.s3.bucket,
//               Key: key
//             };
//
//             s3.deleteObject(params, function (err) {
//               if (err) {
//                 console.log('Error occurred while deleting old profile picture.');
//                 console.log('Check if you have sufficient permissions : ' + err);
//               }
//
//               resolve();
//             });
//           } catch (err) {
//             console.warn(`${existingImageUrl} is not a valid S3 uri`);
//
//             return resolve();
//           }
//         } else {
//           fs.unlink(path.resolve('.' + existingImageUrl), function (unlinkError) {
//             if (unlinkError) {
//
//               // If file didn't exist, no need to reject promise
//               if (unlinkError.code === 'ENOENT') {
//                 console.log('Removing profile image failed because file did not exist.');
//                 return resolve();
//               }
//
//               console.error(unlinkError);
//
//               reject({
//                 message: 'Error occurred while deleting old profile picture'
//               });
//             } else {
//               resolve();
//             }
//           });
//         }
//       } else {
//         resolve();
//       }
//     });
//   }
//
//   function login() {
//     return new Promise(function (resolve, reject) {
//       req.login(user, function (err) {
//         if (err) {
//           res.status(400).send(err);
//         } else {
//           resolve();
//         }
//       });
//     });
//   }
// };
/**
 * Send User
 */
exports.me = function (req, res) {
    // Sanitize the user - short term solution. Copied from core.server.controller.js
    // TODO create proper passport mock: See https://gist.github.com/mweibel/5219403
    let safeUserObject = null;
    if (req.user) {
        safeUserObject = {
            displayName: validator_1.escape(req.user.displayName),
            provider: validator_1.escape(req.user.provider),
            username: validator_1.escape(req.user.username),
            created: req.user.created.toString(),
            roles: req.user.roles,
            profileImageURL: req.user.profileImageURL,
            email: validator_1.escape(req.user.email),
            lastName: validator_1.escape(req.user.lastName),
            firstName: validator_1.escape(req.user.firstName),
            additionalProvidersData: req.user.additionalProvidersData
        };
    }
    res.json(safeUserObject || null);
};
//# sourceMappingURL=users.profile.server.controller.js.map