import { ConfigModule } from '@nestjs/config'
import { format, transports, LoggerOptions } from 'winston'
import { Format } from 'logform'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

/**
 * Load different dotenv files in different environments, we use multiple path so they are extended one by one:
 *
 * **The leftmost has the highest priority.**
 */
const envFileMap = {
  development: ['.env', '.development.env', '.testing.env', '.production.env'],
  testing: ['.env', '.testing.env', '.production.env'],
  // jest will set NODE_ENV to 'test' automatically
  test: ['.env', '.testing.env', '.production.env'], // Alias of testing
  production: ['.env', '.production.env'],
}
const envFilePath = envFileMap[process.env.NODE_ENV] ?? '.env'
// console.debug(process.env.NODE_ENV, envFilePath)

/**
 * Log format generator
 *
 * @param color
 * @return {Format}
 */
function genLogFormat (color = false): Format {
  const formatters = [
    format.label({ label: 'Main' }),
    format.timestamp(),
    format.metadata({ fillExcept: ['timestamp', 'level', 'label', 'message', 'context', 'trace', 'stack'] }),
  ]

  let logFormat: Format
  if (color) {
    logFormat = format.combine(
      ...formatters,
      format.colorize({ all: true }),
      format.printf(({ level, message, label, timestamp, context, metadata, trace, stack }): string => {
        label = context ?? label
        trace = trace || stack
        return `[${timestamp}] [${level}] [${label}] ${message} ${JSON.stringify(metadata)}` + (trace ? `\n${trace.toString()}` : '')
      }),
    )
  }
  else {
    logFormat = format.combine(
      ...formatters,
      format.json(),
    )
  }

  return logFormat
}

export interface Config {
  env: string,
  baseUrl: string,
  hostname: string,
  port: number,
  swaggerPath: string,

  log: LoggerOptions,

  // Must follow options at https://github.com/expressjs/session#options
  session: {
    secret: string,
    maxAge: number,
  },

  // Must follow options at https://github.com/kyknow/nestjs-redis
  redis: Array<{
    name?: string,
    url: string,
  }>,

  // Must follow options at https://typeorm.io/#/connection-options
  mysql: TypeOrmModuleOptions,

  // Must follow options at http://www.passportjs.org/packages/passport-twitter/
  twitter: {
    consumerKey: string,
    consumerSecret: string,
    callbackURL: string,
  },

  // Must follow options at https://github.com/IvanWei/passport-line-auth/#options
  line: {
    channelID: string,
    channelSecret: string,
    callbackURL: string,
    scope: string[],
    botPrompt?: string,
    uiLocales?: string,
  },
}

export function configLoader (): Config {
  return {
    env: process.env.NODE_ENV,
    baseUrl: process.env.BASE_URL,
    hostname: process.env.HOST ?? '127.0.0.1',
    port: parseInt(process.env.PORT, 10) ?? 8080,
    swaggerPath: '/docs',

    log: {
      level: process.env.LOG_LEVEL,
      format: genLogFormat(process.env.LOG_COLOR === 'true'),
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
      callbackURL: '/auth/twitter'
    },

    line: {
      channelID: process.env.LINE_CHANNEL_ID,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
      callbackURL: '/auth/line',
      scope: ['profile', 'openid', 'email'],
    }
  }
}

export const configModule = ConfigModule.forRoot({
  isGlobal: true, // No need to import ConfigModule everywhere
  envFilePath,
  load: [configLoader],
})
