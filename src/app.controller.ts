import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Get, Controller, Session, Inject } from '@nestjs/common'
import { Redis } from 'ioredis'
import { RedisService } from 'nestjs-redis'

@Controller()
export class AppController {
  readonly redis: Redis

  constructor (
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    redis: RedisService,
  ) {
    this.redis = redis.getClient()
    this.logger = logger.child({ context: AppController.name })
  }

  @Get('/ping')
  ping (): string {
    this.logger.info('Pong')
    return ''
  }
}
