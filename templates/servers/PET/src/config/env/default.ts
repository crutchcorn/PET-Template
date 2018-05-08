import {TestConfig} from 'owasp-password-strength-test';

module.exports = {
  app: {
    title: '{{constantCase name}}' as string,
    description: 'A Passport Express TypeORM backend server template Edit' as string,
    keywords: 'typeorm, express, passport, node.js' as string,
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID as string || 'GOOGLE_ANALYTICS_TRACKING_ID' as string
  },
  db: {
    promise: global.Promise as Function
  },
  port: process.env.PORT as string || 3000 as number,
  host: process.env.HOST as string || '0.0.0.0' as string,
  // DOMAIN config should be set to the fully qualified application accessible
  // URL. For example: https://www.myapp.com (including port if required).
  domain: process.env.DOMAIN as string,
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000) as number,
    // session can be made to "remember me" and change the maxAge to two weeks
    rememberMaxAge: 2 * 7 * 24 * (60 * 60 * 1000) as number,
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true as boolean,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false as boolean
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: process.env.SESSION_SECRET as string || '{{constantCase name}}' as string,
  // sessionKey is the cookie session name
  sessionKey: 'sessionId' as string,
  sessionCollection: 'sessions' as string,
  // Lusca config
  csrf: {
    csrf: false as boolean,
    csp: false as boolean,
    xframe: 'SAMEORIGIN' as string,
    p3p: 'ABCDEF' as string,
    xssProtection: true as boolean
  },
  favicon: 'src/favicon.ico' as string,
  illegalUsernames: ['administrator', 'password', 'admin', 'user',
    'unknown', 'anonymous', 'null', 'undefined', 'api'
  ] as string[],
  aws: {
    s3: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      bucket: process.env.S3_BUCKET as string
    }
  },
  uploads: {
    // Storage can be 'local' or 's3'
    storage: process.env.UPLOADS_STORAGE as string || 'local' as string,
    profile: {
      image: {
        dest: './modules/users/client/img/profile/uploads/' as string,
        limits: {
          fileSize: 1 * 1024 * 1024 as number // Max file size in bytes (1 MB)
        }
      }
    }
  },
  shared: {
    owasp: {
      allowPassphrases: true as boolean,
      maxLength: 128 as number,
      minLength: 10 as number,
      minPhraseLength: 20 as number,
      minOptionalTestsToPass: 4 as number
    }
  }
} as envDefault;

export interface envDefault {
  app: {
    title: string,
    description: string,
    keywords: string,
    googleAnalyticsTrackingID: string
  },
  db: {
    promise: Function
  },
  port: string | number,
  host: string,
  domain: string,
  sessionCookie: {
    maxAge: number,
    rememberMaxAge: number,
    httpOnly: boolean,
    secure: boolean
  },
  sessionSecret: string,
  sessionKey: string,
  sessionCollection: string,
  csrf: {
    csrf: boolean,
    csp: boolean,
    xframe: string,
    p3p: string,
    xssProtection: boolean
  },
  favicon: string,
  illegalUsernames: string[],
  aws: {
    s3: {
      accessKeyId: string,
      secretAccessKey: string,
      bucket: string
    }
  },
  uploads: {
    storage: string,
    profile: {
      image: {
        dest: string,
        limits: {
          fileSize: number
        }
      }
    }
  },
  shared: {
    owasp: Partial<TestConfig>
  }
}