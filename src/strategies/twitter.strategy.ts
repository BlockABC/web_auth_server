import { Profile, Strategy } from 'passport-twitter'

import { strategyFactory } from './factory'
import { IOAuthStrategy, IUser } from './interface'

export const {
  controller: TwitterStrategyController,
  strategy: TwitterStrategy,
} = strategyFactory({
  strategyName: 'twitter',
  passportStrategyClass: Strategy,
  validateFunc: async function (this: IOAuthStrategy, accessToken: string, accessTokenSecret: string, profile: Profile, done: (error: any, user?: any) => void): Promise<IUser> {
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
})
