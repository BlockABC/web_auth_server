import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Get, Controller, Session, Inject } from '@nestjs/common'
import { Redis } from 'ioredis'
import { RedisService } from 'nestjs-redis'

@Controller()
export class AppController {
  @Inject(WINSTON_MODULE_PROVIDER)
  readonly logger: Logger

  readonly redis: Redis

  constructor (redis: RedisService) {
    this.redis = redis.getClient()
  }

  @Get('/')
  root (@Session() session): string {
    session.test = 1

    this.redis.set('test:a', 1)

    this.logger.info('test logger')

    return 'Hello World!'
  }
}
