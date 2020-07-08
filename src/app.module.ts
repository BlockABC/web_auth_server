import ConnectRedis from 'connect-redis'
import session from 'express-session'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WinstonModule } from 'nest-winston'
import { RedisModule, RedisModuleOptions, RedisService } from 'nestjs-redis'
import { SessionModule, NestSessionOptions } from 'nestjs-session'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { AppController } from './app.controller'

import { configLoader, configModule } from './config'
import { AuthModule } from './auth/auth.module'
import { ApiModule } from './api/api.module'

const RedisStore = ConnectRedis(session)

@Module({
  imports: [
    // Register winston logger for injection, it is global by default
    WinstonModule.forRoot(configLoader().log),
    configModule,
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
            secret: config.get('session.secret'),
          },
        }
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<TypeOrmModuleOptions> => {
        return config.get('mysql')
      },
    }),
    AuthModule,
    ApiModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [],
  exports: [],
})
export class AppModule {
}
