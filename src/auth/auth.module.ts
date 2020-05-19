import { MiddlewareConsumer, Module } from '@nestjs/common'

import { RedirectMiddleware } from './redirect.middleware'
import { TwitterStrategy, TwitterStrategyController } from '../strategies/twitter.strategy'
import { LineStrategy, LineStrategyController } from '../strategies/line.strategy'

@Module({
  providers: [
    // LineStrategy,
    TwitterStrategy,
  ],
  controllers: [
    // LineStrategyController,
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
