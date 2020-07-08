import trimEnd from 'lodash/trimEnd'
import { Logger } from 'winston'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'

import { IOAuthStrategy, IUser } from '../interface'
import { isNil } from 'lodash'

/**
 * Prefix callback url with base url
 *
 * @param {ConfigService} config
 * @returns {any}
 */
function getStrategyConfig (strategyName: string, config: ConfigService): any {
  const strategyConfig = config.get(strategyName)
  strategyConfig.callbackURL = trimEnd(config.get('baseUrl'), '/') + strategyConfig.callbackURL
  return strategyConfig
}

/**
 * OAuthStrategy
 *
 * Config passport to use OAuth passport strategy. Passport instance will be created by super(), and the validate method equals
 * to the verify` callback of OAuth passport strategy.
 */
export function OAuthStrategy (Strategy: any, strategyName?: string | undefined) {
  abstract class MixinStrategy extends PassportStrategy(Strategy, strategyName) implements IOAuthStrategy {
    protected readonly config: ConfigService
    protected readonly logger: Logger

    constructor (config: ConfigService, logger: Logger) {
      if (isNil(config) || isNil(logger)) throw new Error('ConfigService and Logger is required.')
      super(getStrategyConfig(strategyName, config))
      this.config = config
      this.logger = logger.child({ context: `${OAuthStrategy.name}<${strategyName}>` })
    }

    abstract validate (...args): Promise<IUser>;
  }

  return MixinStrategy
}
