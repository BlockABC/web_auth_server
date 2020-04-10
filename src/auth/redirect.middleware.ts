import { Redis } from 'ioredis'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { RedisService } from 'nestjs-redis'
import { Logger } from 'winston'
import { Request, Response } from 'express'
import { Inject, Injectable, NestMiddleware } from '@nestjs/common'

/**
 * RedirectMiddleware
 *
 * This is used in conjunction with OAuth strategies. It allow user go through the whole OAuth flow, and then redirect back
 * to frontend page with a key in query string. Frontend page can retrieve user info from backend server with the key.
 */
@Injectable()
export class RedirectMiddleware implements NestMiddleware {
  private readonly redis: Redis

  constructor (
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    redis: RedisService
  ) {
    this.redis = redis.getClient()
    this.logger = logger.child({ context: RedirectMiddleware.name })
  }

  async use (req: Request, res: Response, next: Function): Promise<void> {
    // If found redirect url in query string, then store it in session
    if (req.query?.redirect) {
      this.logger.verbose(`Redirect url found: ${req.query.redirect}`)
      req.session.redirect = req.query.redirect
    }

    try {
      next()
    }
    catch (err) {
      next(err)
    }
  }
}
