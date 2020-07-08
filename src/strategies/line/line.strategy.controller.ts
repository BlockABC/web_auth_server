import { ApiResponse } from '@nestjs/swagger'
import { URL } from 'url'
import random from 'crypto-random-string'
import { Redis } from 'ioredis'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { RedisService } from 'nestjs-redis'
import { Logger } from 'winston'
import { Controller, Inject } from '@nestjs/common'

import { STRATEGY_NAME } from './line.strategy'
import { OAuthStrategyController } from '../common'

@Controller(`auth/${STRATEGY_NAME}`)
export class LineStrategyController extends OAuthStrategyController(STRATEGY_NAME) {
  constructor (redis: RedisService, @Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    super(redis, logger)
  }
}
