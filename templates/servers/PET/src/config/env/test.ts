const defaultEnvConfig = require('./default');

module.exports = {
  db: {
    host:  process.env.DATABASE_URL || "localhost",
    port: process.env.DATABASE_PORT || 5432,
    username: process.env.DATABASE_USER || "test",
    password: process.env.DATABASE_PASS || "test",
    database: process.env.DATABASE_DB || "test",
    synchronize: true,
  },
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
  port: process.env.PORT || 3001,
  app: {
    title: defaultEnvConfig.app.title + ' - Test Environment'
  },
  uploads: {
    profile: {
      image: {
        // TODO: Fix the location here
        dest: './modules/users/client/img/profile/uploads/',
        limits: {
          fileSize: 100000 // Limit filesize (100kb) for testing purposes
        }
      }
    }
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
} as envTest;

export interface envTest {
  log: any,
  port: string | number,
  app: {
    title: string
  },
  uploads: {
    profile: {
      image: {
        dest: string,
        limits: {
          fileSize: number
        }
      }
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
