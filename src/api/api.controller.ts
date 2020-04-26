import { ApiOkResponse, ApiProperty } from '@nestjs/swagger'
import isNil from 'lodash/isNil'
import { Request as Req } from 'express'
import { Redis } from 'ioredis'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { RedisService } from 'nestjs-redis'
import { Logger } from 'winston'
import { Controller, Get, Inject, Request } from '@nestjs/common'

import { ParamError, ServerError } from '../error'
import { CacheKeyPrefix } from '../constants'
import { IUser } from '../strategies/interface'

class User implements IUser {
  @ApiProperty({ description: 'It may be access token in some of SNS because they do not have openId or userId.' })
  openId: string

  @ApiProperty({ description: 'The username be able to display.' })
  nickname: string

  @ApiProperty({ description: 'Various user profile depending on the SNS.' })
  profile: any
}

@Controller('api')
export class ApiController {
  private readonly redis: Redis

  constructor (
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    redis: RedisService
  ) {
    this.redis = redis.getClient()
    this.logger = logger.child({ context: ApiController.name })
  }

  @Get('oauth-data')
  @ApiOkResponse({ type: User, description: 'User profile info.' })
  async index (@Request() req: Req): Promise<IUser> {
    if (!req.query.key) {
      throw ParamError.fromCode(10000, 'key')
    }

    this.logger.info(`Try to retrieve OAuth data of key: ${req.query.key}`)

    const key = CacheKeyPrefix.Profile + req.query.key
    const data = await this.redis.get(key)
    if (isNil(data)) {
      throw ParamError.fromCode(10001, 'key')
    }

    let ret: IUser
    try {
      ret = JSON.parse(data) as IUser
    }
    catch (err) {
      throw ServerError.fromCode(90000)
    }

    // Expire data after a few minutes
    await this.redis.setex(key, 300, data)

    return ret
  }
}
