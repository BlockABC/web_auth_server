import { Test } from '@nestjs/testing'
import { Redis } from 'ioredis'
import { WinstonModule } from 'nest-winston'
import { RedisService } from 'nestjs-redis'
import { configLoader, configModule } from '../config'
import { redisMockProvider } from '../test-helper'
import { RedirectMiddleware } from './redirect.middleware'

describe('RedirectMiddleware', () => {
  let middleware: RedirectMiddleware
  let redis: Redis

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot(configLoader().log),
        configModule,
      ],
      providers: [
        redisMockProvider,
        RedirectMiddleware,
      ],
    }).compile()

    redis = module.get<RedisService>(RedisService).getClient()
    middleware = module.get<RedirectMiddleware>(RedirectMiddleware)
  })

  it('should store redirect to session', () => {
    const next = jest.fn()
    const req = { query: { redirect: 'test' }, session: {} }
    const res = {}

    middleware.use((req as any), (res as any), next)

    expect((req.session as any).redirect).toBe(req.query.redirect)
    expect(next).toBeCalled()
  })
})
