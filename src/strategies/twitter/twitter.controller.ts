import { URL } from 'url'
import random from 'crypto-random-string'
import { Redis } from 'ioredis'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { RedisService } from 'nestjs-redis'
import { Logger } from 'winston'
import { Request as Req, Response as Res } from 'express'
import { Controller, Get, Inject, UseGuards, Request, Response } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { IUser } from '../interface'
import { CacheKeyPrefix, RandomCharset } from '../../constants'

@Controller('auth/twitter')
export class TwitterController {
  private readonly redis: Redis

  constructor (
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    redis: RedisService
  ) {
    this.redis = redis.getClient()
  }

  @UseGuards(AuthGuard('twitter'))
  @Get()
  async index (@Request() req: Req, @Response() res: Res): Promise<IUser | null> {
    if (req.session.redirect && req.session.redirect !== req.query?.redirect) {
      // Cache user info with a random key
      const key = random({ length: 12, characters: RandomCharset })
      await this.redis.setex(CacheKeyPrefix.Profile + key, 3600, JSON.stringify(req.user))
      this.logger.verbose(`RedirectMiddleware cache user with key: ${key}`)
      // Add the key to redirect url so that target page could retrieve user info with the key
      const url = new URL(req.session.redirect)
      url.searchParams.set('key', key)

      delete req.session.redirect
      res.redirect(url.toString())
    }

    return req.user as IUser
  }
}
