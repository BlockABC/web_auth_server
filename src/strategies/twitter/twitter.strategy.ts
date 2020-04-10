import { Strategy, Profile } from 'passport-twitter'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { IUser } from '../interface'

/**
 * TwitterStrategy
 *
 * Config passport to use twitter strategy. Passport instance will be created by super(), and the validate method equals
 * to the verify` callback of passport twitter strategy.
 */
@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy) {
  constructor (
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private config: ConfigService,
  ) {
    super(config.get('twitter'))
  }

  async validate (accessToken: string, accessTokenSecret: string, profile: Profile, done: (error: any, user?: any) => void): Promise<IUser> {
    this.logger.info(`TwitterStrategy.validate validate user[${profile.id}]`)

    this.logger.verbose(`TwitterStrategy.validate token: ${accessToken} ; secret: ${accessTokenSecret}`)
    this.logger.debug(`TwitterStrategy.validate profile: ${profile._raw}`)

    const user: IUser = {
      openId: accessToken,
      nickname: profile._json.name,
      profile: profile._json,
    }

    done(null, user)
    return user
  }
}
