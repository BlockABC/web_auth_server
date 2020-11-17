import { Controller, Get, Inject, Query } from '@nestjs/common'
import { ApiOkResponse, ApiProperty } from '@nestjs/swagger'
import { Redis } from 'ioredis'
import isNil from 'lodash/isNil'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { RedisService } from 'nestjs-redis'
import { Logger } from 'winston'
import { CacheKeyPrefix, ParamErrorCode, ServerErrorCode } from '../constants'

import { ParamError, ServerError } from '../error'
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
  async index (@Query() query: { key: string }): Promise<IUser> {
    if (!query.key) {
      throw ParamError.fromCode(ParamErrorCode.Required, 'key')
    }

    this.logger.info(`Try to retrieve OAuth data of key: ${query.key}`)

    const key = CacheKeyPrefix.Profile + query.key
    const data = await this.redis.get(key)
    if (isNil(data)) {
      throw ParamError.fromCode(ParamErrorCode.KeyNotExist, 'key')
    }

    let ret: IUser
    try {
      ret = JSON.parse(data) as IUser
    }
    catch (err) {
      throw ServerError.fromCode(ServerErrorCode.CacheDataCorrupted)
    }

    // Expire data after a few minutes
    await this.redis.setex(key, 300, data)

    return ret
  }
}
