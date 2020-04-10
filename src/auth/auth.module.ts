import { MiddlewareConsumer, Module } from '@nestjs/common'

import { RedirectMiddleware } from './redirect.middleware'
import { TwitterStrategy, TwitterStrategyController } from '../strategies/twitter.strategy'

@Module({
  providers: [
    TwitterStrategy,
  ],
  controllers: [
    TwitterStrategyController,
  ]
})
export class AuthModule {
  configure (consumer: MiddlewareConsumer) {
    consumer
      .apply(RedirectMiddleware)
      .forRoutes('auth/*')
  }
}
