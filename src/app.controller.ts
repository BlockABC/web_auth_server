import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Get, Controller, Inject } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'

@Controller()
export class AppController {
  constructor (
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.logger = logger.child({ context: AppController.name })
  }

  @Get('/ping')
  @ApiOkResponse({ description: 'Service is online.' })
  ping (): string {
    this.logger.info('GET /ping')
    return 'pong'
  }
}
