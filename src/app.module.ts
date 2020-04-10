import ConnectRedis from 'connect-redis'
import session from 'express-session'
import { Module, Logger, LoggerService, NestModule, MiddlewareConsumer, CacheModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { WinstonModule, WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { RedisModule, RedisService, RedisModuleOptions } from 'nestjs-redis'
import { SessionModule, NestSessionOptions } from 'nestjs-session'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'

import { configLoader } from './config'
import { StrategiesModule } from './strategies/strategies.module'
import { ApiModule } from './api/api.module';

const RedisStore = ConnectRedis(session)

// Load different .env files according to NODE_ENV.
const envFileMap = {
  development: ['.development.env', '.env'],
  testing: ['.testing.env', '.env'],
  production: '.env'
}
const envFilePath = envFileMap[process.env.NODE_ENV] ?? '.env'

@Module({
  imports: [
    // Register winston logger for injection, it is global by default
    WinstonModule.forRoot(configLoader().log),
    ConfigModule.forRoot({
      isGlobal: true, // No need to import ConfigModule everywhere
      envFilePath,
      load: [configLoader],
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<RedisModuleOptions> => {
        return config.get('redis')
      },
    }),
    SessionModule.forRootAsync({
      imports: [RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: async (config: ConfigService, redis: RedisService): Promise<NestSessionOptions> => {
        const redisClient = redis.getClient()
        const store = new RedisStore({ client: redisClient as any })
        return {
          session: {
            store,
            secret: config.get('session.secret')
          },
        }
      },
    }),
    ScheduleModule.forRoot(),
    StrategiesModule,
    ApiModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
  ],
  exports: [
  ]
})
export class ApplicationModule {
}
