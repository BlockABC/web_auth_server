import { Logger } from 'winston'
import { ConfigService } from '@nestjs/config'

export interface IOAuthStrategy {
  readonly logger: Logger,
  readonly config: ConfigService,

  validate: Function,
}

export interface IUser {
  openId: string,
  nickname: string,
  profile: any,
}
