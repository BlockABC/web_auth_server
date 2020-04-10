import { MiddlewareConsumer, Module } from '@nestjs/common'

import { RedirectMiddleware } from './redirect.middleware'
import { TwitterController } from './twitter/twitter.controller'
import { TwitterStrategy } from './twitter/twitter.strategy'

@Module({
  providers: [
    TwitterStrategy,
  ],
  controllers: [
    TwitterController,
  ]
})
export class StrategiesModule {
  configure (consumer: MiddlewareConsumer) {
    consumer
      .apply(RedirectMiddleware)
      .forRoutes('*')
  }
}
