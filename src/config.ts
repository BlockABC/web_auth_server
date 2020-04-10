import trimEnd from 'lodash/trimEnd'
import { format, transports, LoggerOptions } from 'winston'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export interface Config {
  env: string,
  hostname: string,
  port: number,

  log: LoggerOptions,

  // Must follow options at https://github.com/expressjs/session#options
  session: {
    secret: string,
    maxAge: number,
  },

  // Must follow options at https://github.com/kyknow/nestjs-redis
  redis: {
    name?: string,
    url: string,
  }[],

  // Must follow options at https://typeorm.io/#/connection-options
  mysql: TypeOrmModuleOptions,

  // Must follow options at http://www.passportjs.org/packages/passport-twitter/
  twitter: {
    consumerKey: string,
    consumerSecret: string,
    callbackURL: string,
  },
}

export function configLoader (): Config {
  return {
    env: process.env.NODE_ENV,
    hostname: process.env.HOST ?? '127.0.0.1',
    port: parseInt(process.env.PORT, 10) ?? 8080,

    log: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'verbose',
      format: format.combine(
        format.label({ label: 'Main' }),
        format.timestamp(),
        format.colorize({ all: true }),
        format.printf(({ level, message, label, timestamp }): string => {
          return `[${timestamp}] [${level}] [${label}] ${message}`
        })
      ),
      transports: [
        new transports.Console(),
      ]
    },

    session: {
      secret: process.env.SESSION_SECRET,
      maxAge: 86400 * 7 * 1000,
    },

    redis: [
      {
        // name: 'default',
        url: process.env.REDIS_URL,
      }
    ],

    mysql: {
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT, 10) ?? 3306,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      charset: 'utf8mb4_unicode_ci',
      retryAttempts: 3,
      autoLoadEntities: true,
      entities: [
        'dist/**/*.entity.{ .ts,.js}',
      ],
    },

    twitter: {
      consumerKey: process.env.TWITTER_API_KEY,
      consumerSecret: process.env.TWITTER_API_SECRET,
      callbackURL: `${trimEnd(process.env.BASE_URL, '/')}/auth/twitter`
    }
  }
}
