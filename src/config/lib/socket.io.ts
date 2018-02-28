// Load the module dependencies
const config = require('../config');

import * as path from 'path';
import * as fs from 'fs';
import {listen} from 'socket.io';
import * as http from 'http';
import * as https from 'https';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import chalk from 'chalk';

// Define the Socket.io configuration method
export default function (app, db) {
  let server;
  if (config.secure && config.secure.ssl === true) {
    // Load SSL key and certificate
    const privateKey = fs.readFileSync(path.resolve(config.secure.privateKey), 'utf8');
    const certificate = fs.readFileSync(path.resolve(config.secure.certificate), 'utf8');
    let caBundle;

    try {
      caBundle = fs.readFileSync(path.resolve(config.secure.caBundle), 'utf8');
    } catch (err) {
      console.log(chalk.yellow('Warning: couldn\'t find or read caBundle file'));
    }

    let options = {
      key: privateKey,
      cert: certificate,
      ca: caBundle,
      //  requestCert : true,
      //  rejectUnauthorized : true,
      secureProtocol: 'TLSv1_method',
      ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'DHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-SHA256',
        'DHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'DHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES256-SHA256',
        'DHE-RSA-AES256-SHA256',
        'HIGH',
        '!aNULL',
        '!eNULL',
        '!EXPORT',
        '!DES',
        '!RC4',
        '!MD5',
        '!PSK',
        '!SRP',
        '!CAMELLIA'
      ].join(':'),
      honorCipherOrder: true
    };

    // Create new HTTPS Server
    server = https.createServer(options, app);
  } else {
    // Create a new HTTP server
    server = http.createServer(app);
  }
  // Create a new Socket.io server
  const io = listen(server);

  // Create a MongoDB storage object
  var mongoStore = new MongoStore({
    db: db,
    collection: config.sessionCollection
  });

  // Intercept Socket.io's handshake request
  io.use(function (socket, next) {
    // Use the 'cookie-parser' module to parse the request cookies
    cookieParser(config.sessionSecret)(socket.request, {}, function (err) {
      // Get the session id from the request cookies
      var sessionId = socket.request.signedCookies ? socket.request.signedCookies[config.sessionKey] : undefined;

      if (!sessionId) return next(new Error('sessionId was not found in socket.request'));

      // Use the mongoStorage instance to get the Express session information
      mongoStore.get(sessionId, function (err, session) {
        if (err) return next(err);
        if (!session) return next(new Error('session was not found for ' + sessionId));

        // Set the Socket.io session information
        socket.request.session = session;

        // Use Passport to populate the user details
        passport.initialize()(socket.request, {}, function () {
          passport.session()(socket.request, {}, function () {
            if (socket.request.user) {
              next();
            } else {
              next(new Error('User is not authenticated'));
            }
          });
        });
      });
    });
  });

  // Add an event listener to the 'connection' event
  io.on('connection', function (socket) {
    config.files.server.sockets.forEach(function (socketConfiguration) {
      require(path.resolve(socketConfiguration))(io, socket);
    });
  });

  return server;
};
