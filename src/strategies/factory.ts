import trimEnd from 'lodash/trimEnd'
import { Strategy } from 'passport'
import { URL } from 'url'
import random from 'crypto-random-string'
import { Redis } from 'ioredis'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { RedisService } from 'nestjs-redis'
import { Logger } from 'winston'
import { Request as Req, Response as Res } from 'express'
import { Controller, Get, Inject, UseGuards, Request, Response, Type, Injectable } from '@nestjs/common'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'

import { IOAuthStrategy, IUser } from './interface'
import { CacheKeyPrefix, RandomCharset } from '../constants'

/**
 * OAuth Strategy controller factory
 *
 * @param {string} strategyName This must be the same as oauthStrategyFactory
 * @param {string} [path] Route path of the controller, default is 'auth/${strategyName}'
 * @returns {OAuthStrategyController}
 */
export function oauthStrategyControllerFactory (
  { strategyName, routePath }:
  { strategyName: string, routePath?: string }
): Type<any> {
  routePath = routePath ?? `auth/${strategyName}`

  /**
   * OAuthStrategyController
   *
   * Accept requests and start OAuth flow.
   */
  @Controller(routePath)
  class OAuthStrategyController {
    private readonly redis: Redis

    constructor (
      @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
      redis: RedisService
    ) {
      this.redis = redis.getClient()
      this.logger = logger.child({ context: `${OAuthStrategyController.name}(${strategyName})` })
    }

    @UseGuards(AuthGuard(strategyName))
    @Get()
    async index (@Request() req: Req, @Response() res: Res): Promise<Res<any> | void> {
      this.logger.info(`Oauth ${strategyName} done successfully.`)
      this.logger.verbose(`Oauth ${strategyName} query:`, { ...req.query })

      if (req.session.redirect && req.session.redirect !== req.query?.redirect) {
        // Cache user info with a random key
        const key = random({ length: 12, characters: RandomCharset })
        await this.redis.setex(CacheKeyPrefix.Profile + key, 3600, JSON.stringify(req.user))
        this.logger.verbose(`RedirectMiddleware cache user with key: ${key}`)
        // Add the key to redirect url so that target page could retrieve user info with the key
        const url = new URL(req.session.redirect)
        url.searchParams.set('key', key)

        delete req.session.redirect

        return res.redirect(url.toString())
      }

      return res.json(req.user)
    }
  }

  return OAuthStrategyController
}

/**
 * OAuth Strategy factory
 *
 * @param {string} strategyName
 * @param {Type<Strategy>} passportStrategyClass Strategies implement passport interface
 * @param {Function} validateFunc Verify callback of passport strategy
 * @return {OAuthStrategy}
 */
export function oauthStrategyFactory (
  { strategyName, passportStrategyClass, validateFunc }:
  { strategyName: string, passportStrategyClass: Type<Strategy>, validateFunc: Function }
): Type<IOAuthStrategy> {
  /**
   * Prefix callback url with base url
   *
   * @param {ConfigService} config
   * @returns {any}
   */
  function prefixCallbackUrl (config: ConfigService): any {
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
  @Injectable()
  class OAuthStrategy extends PassportStrategy(passportStrategyClass, strategyName) implements IOAuthStrategy {
    constructor (
      @Inject(WINSTON_MODULE_PROVIDER) readonly logger: Logger,
      readonly config: ConfigService,
    ) {
      super(prefixCallbackUrl(config))
      this.logger = logger.child({ context: `${OAuthStrategy.name}(${strategyName})` })
    }

    validate (...args) {
      return validateFunc.call(this, ...args)
    }
  }

  return OAuthStrategy
}

export function strategyFactory (
  { strategyName, routePath, passportStrategyClass, validateFunc }:
  { strategyName: string, routePath?: string, passportStrategyClass: Type<Strategy>, validateFunc: Function }
): {
    controller: Type<any>,
    strategy: Type<IOAuthStrategy>,
  } {
  return {
    controller: oauthStrategyControllerFactory({ strategyName, routePath }),
    strategy: oauthStrategyFactory({ strategyName, passportStrategyClass, validateFunc }),
  }
}
