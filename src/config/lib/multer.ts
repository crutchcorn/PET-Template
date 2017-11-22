export function imageFileFilter(req, file, callback) {
  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
    var err = new Error();
    (<any>err).code = 'UNSUPPORTED_MEDIA_TYPE'; // TODO: Fix type issue here
    return callback(err, false);
  }
  callback(null, true);
};

