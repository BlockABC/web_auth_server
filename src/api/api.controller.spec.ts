import { Test } from '@nestjs/testing'
import { Redis } from 'ioredis'
import { WinstonModule } from 'nest-winston'
import { RedisService } from 'nestjs-redis'

import { configLoader, configModule } from '../config'
import { CacheKeyPrefix } from '../constants'
import { IUser } from '../strategies/interface'
import { redisMockProvider } from '../test-helper'
import { ApiController } from './api.controller'

const user: IUser = {
  'openId': 'Uaafadff6dc0bf6f4fd9ae05fa915829d',
  'nickname': 'Link',
  'profile': {
    'userId': 'Uaafadff6dc0bf6f4fd9ae05fa915829d',
    'displayName': 'Link'
  }
}

describe('ApiController', () => {
  let controller: ApiController
  let redis: Redis

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot(configLoader().log),
        configModule,
      ],
      providers: [
        redisMockProvider,
      ],
      controllers: [ApiController],
    }).compile()

    redis = module.get<RedisService>(RedisService).getClient()
    controller = module.get<ApiController>(ApiController)
  })

  describe('index', () => {
    it('should should throw 10000 if query string invalid', async () => {
      const query = {}
      // @ts-ignore
      await expect(controller.index(<any>query)).rejects.toThrowParamError(10000)
    })

    it('should should throw 10001 if cache not found', async () => {
      const query = { key: 'unittest' }
      // @ts-ignore
      await expect(controller.index(<any>query)).rejects.toThrowParamError(10001)
    })

    it('should should throw 90000 if cache is not valid JSON', async () => {
      const query = { key: 'unittest' }
      await redis.set(CacheKeyPrefix.Profile + query.key, 'xxxxxx')
      // @ts-ignore
      await expect(controller.index(<any>query)).rejects.toThrowParamError(90000)
    })

    it('should return object implement IUser', async () => {
      const query = { key: 'unittest' }
      await redis.set(CacheKeyPrefix.Profile + query.key, JSON.stringify(user))
      // @ts-ignore
      await expect(controller.index(<any>query)).resolves.toEqual(expect.objectContaining({
        openId: expect.any(String),
        nickname: expect.any(String),
        profile: expect.anything(),
      }))
    })
  })
})
