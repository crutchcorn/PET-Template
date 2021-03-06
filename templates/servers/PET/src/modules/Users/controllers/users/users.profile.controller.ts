'use strict';

import {Request, Response} from 'express';
import {User} from '../../models/user.model';
import {getManager} from 'typeorm';

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

const userRepository = getManager().getRepository(User);

const whitelistedFields = ['firstName', 'lastName', 'email', 'username'];

function pick(o, ...props) {
  return Object.assign({}, ...props.map(prop => ({[prop]: o[prop]})));
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
export async function update(req: Request, res: Response) {
  // Init Variables
  let user = await userRepository.findOne(req.user.id);
  // Add error handling if user not logged in
  
  if (user) {
    // Update whitelisted fields only
    user = Object.assign(user, pick(req.body, whitelistedFields));

    user.displayName = user.firstName + ' ' + user.lastName;

    try {
      user = await userRepository.save(user);

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    } catch (err) {
      res.status(500).send('There was an error trying to update the user');
    }
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

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
