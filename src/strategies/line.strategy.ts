import { Profile, Strategy } from 'passport-line-auth'

import { strategyFactory } from './factory'
import { IOAuthStrategy, IUser } from './interface'

export const {
  controller: LineStrategyController,
  strategy: LineStrategy,
} = strategyFactory({
  strategyName: 'line',
  passportStrategyClass: Strategy,
  validateFunc: async function (this: IOAuthStrategy, accessToken: string, accessTokenSecret: string, profile: Profile, done: (error: any, user?: any) => void): Promise<IUser> {
    this.logger.info(`OAuth return user ID: ${profile.id}`)
    this.logger.verbose(`OAuth return access token: ${accessToken} ; secret: ${accessTokenSecret}`)
    this.logger.debug(`OAuth return profile: ${profile._raw}`)

    let json = null
    try {
      json = JSON.parse(profile._raw)
    }
    catch {
      this.logger.error(`TwitterStrategy.validate profile: ${profile._raw}`)
    }

    const user: IUser = {
      openId: profile.id,
      nickname: profile.displayName,
      profile: json,
    }

    done(null, user)
    return user
  }
})
