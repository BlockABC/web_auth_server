import * as cacheManager from 'cache-manager'

const memoryCache = cacheManager.caching({ store: 'memory', max: 1000, ttl: 10 })

interface CacheConfig {
  key?: string,
  ttl: number | Function,
}
/**
 * 方法级别的缓存，可以缓存原始值、
 * @param key
 * @param ttl {number} 秒
 * @constructor
 */
export function Cache ({ key, ttl }: CacheConfig = { ttl: 10 }) {
  return function (target: Record<string, any>, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!key) {
      key = `${target.constructor.name}/${propertyKey.toString()}`
    }
    const method = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const cachedItem = await memoryCache.get(key)
      if (cachedItem) {
        return cachedItem // 返回 observable
      }

      const result = await method.apply(this, args)
      const calcTtl = typeof ttl === 'function' ? ttl() : ttl
      await memoryCache.set(key, result, { ttl: calcTtl })
      return result // 返回 observable
    }
  }
}
