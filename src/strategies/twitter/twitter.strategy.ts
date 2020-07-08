import { Profile, Strategy } from 'passport-twitter'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { OAuthStrategy } from '../common'
import { IUser } from '../interface'

export const STRATEGY_NAME = 'twitter'

@Injectable()
export class TwitterStrategy extends OAuthStrategy(Strategy, STRATEGY_NAME) {
  constructor (config: ConfigService, @Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    super(config, logger)
  }

  async validate (accessToken: string, accessTokenSecret: string, profile: Profile, done: (error: any, user?: any) => void): Promise<IUser> {
    this.logger.info(`OAuth return user ID: ${profile.id}`)
    this.logger.verbose(`OAuth return access token: ${accessToken} ; secret: ${accessTokenSecret}`)
    this.logger.debug(`OAuth return profile: ${profile._raw}`)

    const user: IUser = {
      openId: accessToken,
      nickname: profile._json.name,
      profile: profile._json,
    }

    done(null, user)
    return user
  }
}
