import { ApiResponse } from '@nestjs/swagger'
import { URL } from 'url'
import random from 'crypto-random-string'
import { Redis } from 'ioredis'
import { RedisService } from 'nestjs-redis'
import { Logger } from 'winston'
import { Request as Req, Response as Res } from 'express'
import { Get, UseGuards, Request, Response } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CacheKeyPrefix, RandomCharset } from '../../constants'

/**
 * OAuthStrategyController
 *
 * Accept requests and start OAuth flow.
 */
export function OAuthStrategyController (strategyName?: string | undefined) {
  abstract class MixinController {
    protected readonly logger: Logger
    protected readonly redis: Redis

    constructor (redis: RedisService, logger: Logger) {
      this.redis = redis.getClient()
      this.logger = logger.child({ context: `${OAuthStrategyController.name}<${strategyName}>` })
    }

    @UseGuards(AuthGuard(strategyName))
    @Get()
    @ApiResponse({ status: 302, description: 'Redirect to twitter OAuth authorization.' })
    async index (@Request() req: Req, @Response() res: Res): Promise<Res<any> | void> {
      this.logger.info(`Oauth ${strategyName} done successfully.`)
      this.logger.verbose(`Oauth ${strategyName} query string:`, { ...req.query })

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

  return MixinController
}
