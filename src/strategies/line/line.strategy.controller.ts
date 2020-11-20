import { Controller, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { RedisService } from 'nestjs-redis'
import { Logger } from 'winston'
import { OAuthStrategyController } from '../common'

import { STRATEGY_NAME } from './line.strategy'

@Controller(`auth/${STRATEGY_NAME}`)
export class LineStrategyController extends OAuthStrategyController(STRATEGY_NAME) {
  constructor (redis: RedisService, @Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    super(redis, logger)
  }
}
