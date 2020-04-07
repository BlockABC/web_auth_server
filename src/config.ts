import { format, transports, LoggerOptions } from 'winston'

export interface Config {
  env: string,
  hostname: string,
  port: number,

  log: LoggerOptions,

  session: {
    secret: string,
  },

  // Must follow options at https://github.com/kyknow/nestjs-redis
  redis: {
    name?: string,
    url: string,
  }[],
}

export function configLoader (): Config {
  return {
    env: process.env.NODE_ENV,
    hostname: process.env.HOST ?? '127.0.0.1',
    port: parseInt(process.env.PORT, 10) ?? 8080,

    log: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
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
    },

    redis: [
      {
        // name: 'default',
        url: process.env.REDIS_URL,
      }
    ]
  }
}
