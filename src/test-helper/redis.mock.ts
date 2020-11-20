import { Redis } from 'ioredis'
import { RedisService } from 'nestjs-redis'
import IORedis from 'ioredis-mock'

const client = new IORedis()

export const redisMockProvider = {
  provide: RedisService,
  useFactory: (): any => {
    return {
      getClient (): Redis {
        return client
      }
    }
  },
}
