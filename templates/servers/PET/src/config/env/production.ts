import {secureType} from './index';

module.exports = {
  secure: {
    ssl: true,
    privateKey: './config/sslcerts/key.pem',
    certificate: './config/sslcerts/cert.pem',
    caBundle: './config/sslcerts/cabundle.crt'
  },
  port: process.env.PORT || 8443,
  // Binding to 127.0.0.1 is safer in production.
  host: process.env.HOST || '0.0.0.0',
  db: {
    host:  process.env.DATABASE_URL || 'DATABASE_URL',
    port: process.env.DATABASE_PORT || 'DATABASE_PORT',
    username: process.env.DATABASE_USER || 'DATABASE_USER',
    password: process.env.DATABASE_PASS || 'DATABASE_PASS',
    database: process.env.DATABASE_DB || 'DATABASE_DB',
    // Set to false so the database is not changing in ways that are not expected
    synchronize: false,
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: process.env.LOG_FORMAT || 'combined',
    fileLogger: {
      directoryPath: process.env.LOG_DIR_PATH || process.cwd(),
      fileName: process.env.LOG_FILE || 'app.log',
      maxsize: 10485760,
      maxFiles: 2,
      json: false
    }
  },
  // TODO: Get this working
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    username: '@TWITTER_USERNAME',
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/github/callback'
  },
  paypal: {
    clientID: process.env.PAYPAL_ID || 'CLIENT_ID',
    clientSecret: process.env.PAYPAL_SECRET || 'CLIENT_SECRET',
    callbackURL: '/api/auth/paypal/callback',
    sandbox: false
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
} as envProduction;

export interface envProduction {
  secure: secureType,
  port: string | number,
  // Binding to 127.0.0.1 is safer in production.
  host: string,
  log: {
    format: string,
    fileLogger: {
      directoryPath: string,
      fileName: string,
      maxsize: number,
      maxFiles: number,
      json: boolean
    }
  },
  facebook: {
    clientID: string,
    clientSecret: string,
    callbackURL: string
  },
  twitter: {
    username: string,
    clientID: string,
    clientSecret: string,
    callbackURL: string
  },
  google: {
    clientID: string,
    clientSecret: string,
    callbackURL: string
  },
  linkedin: {
    clientID: string,
    clientSecret: string,
    callbackURL: string
  },
  github: {
    clientID: string,
    clientSecret: string,
    callbackURL: string
  },
  paypal: {
    clientID: string,
    clientSecret: string,
    callbackURL: string
    sandbox: boolean
  },
  mailer: {
    from: string,
    options: {
      service: string,
      auth: {
        user: string,
        pass: string
      }
    }
  },
};
