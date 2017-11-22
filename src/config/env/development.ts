const defaultEnvConfig = require('./default');

module.exports = {
  // TODO: Replace this with TypeORM database stuff if possible
  // db: {
    // uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/mean-dev',
    // options: {},
    // // Enable mongoose debug mode
    // debug: process.env.MONGODB_DEBUG || false
  // },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    fileLogger: {
      directoryPath: process.cwd(),
      fileName: 'app.log',
      maxsize: 10485760,
      maxFiles: 2,
      json: false
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
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
    sandbox: true
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
  livereload: true,
} as envDevelopment;

export interface envDevelopment {
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
  app: {
    title: string
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
  livereload: boolean,
};
