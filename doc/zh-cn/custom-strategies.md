# 自定义 Strategy

首先请看下图：

```
+-------------------+
|                   |
|  Custom Strategy  |
|                   |
+--+-------------+--+
   |             |
+--+-------------+--+
|                   |
|  Nest Strategy    |
|                   |
+--+-------------+--+
   |             |
+--+-------------+----+
|                     |
| Passportjs Strategy |
|                     |
+---------------------+
```

这个框架实际上是利用了 [passportjs](http://www.passportjs.org/) 中的 Strategy 概念和接口，所以自定义 Strategy 实际上是在调用 passportjs 的 Strategy。这使得用户可以轻松地支持 [500+ 的 Strategy](http://www.passportjs.org/packages/) ，其中包括了 Facebook, Google, Reddit, Github, Wechat 等平台！

接下来我们看看如何扩展你自己的 Strategy ：

## 第一步，添加配置

首先，我们需要在 `src/config.ts` 中添加自定义 Strategy 需要用到的 ApiKey, ApiSecret 等信息，具体需要查看对应 passportjs 的 Strategy 文档，比如从 [passport-twitter](https://github.com/jaredhanson/passport-twitter) 的文档我们可以看出 twitter 的 Strategy 需要三个参数：

- consumerKey
- consumerSecret
- callbackURL

所以我们可以在 `src/config.ts` 增加以下配置：

```typescript
export interface Config {
  ... // 其他的一些代码

  // 定义类型信息
  twitter: {
    consumerKey: string,
    consumerSecret: string,
    callbackURL: string,
  },
}

export function configLoader (): Config {
  return {
    ... // 其他的一些代码

    // twitter strategy 的配置
    twitter: { // 这里的 key 是 strategy 的全局名字，必须和下面 strategyName 一致
      consumerKey: process.env.TWITTER_API_KEY, // 通过 process.env 从环境变量中载入具体值
      consumerSecret: process.env.TWITTER_API_SECRET,
      callbackURL: `/auth/twitter` // 回调路由将拼接为 `config.baseUrl + config.twitter.callbackURL`
    }
  }
}
```

## 第二步，创建 Strategy

你需要在 `src/strategies` 下创建你的 strategy 目录，目录名建议和 strategy 名一致，目录中需要创建两个文件：

首先是 `{name}.strategy.ts`：

```typescript
// import 你想要使用的 passportjs strategy，比如本框架中自带的 twitter 示例
import { Profile, Strategy } from 'passport-twitter'
// 更多其他的 imports ...

// Strategy 名称，必须和 src/config.ts 中一致
export const STRATEGY_NAME = 'twitter'

// OAuthStrategy 是来自 `src/strategies/common` 的基类生成函数
@Injectable()
export class TwitterStrategy extends OAuthStrategy(Strategy, STRATEGY_NAME) {
  constructor (config: ConfigService, @Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    super(config, logger)
  }

  // 自定义你的 verify callback 函数，必须返回一个对象，这个对象就是你期望的用户相关信息
  async validate (accessToken: string, accessTokenSecret: string, profile: Profile, done: (error: any, user?: any) => void): Promise<IUser> {
    // 构建你自己的 user 对象，如果希望跨平台的兼容性，可以实现 IUser 标准
    const user: IUser = {
      openId: accessToken,
      nickname: profile._json.name,
      profile: profile._json,
    }

    done(null, user)
    return user
  }
}
```

其次是 `{name}.strategy.controller.ts`:

```typescript
// 这个 controller 仅仅是为了明确 OAuth 的回调路由
@Controller(`auth/${STRATEGY_NAME}`)
export class TwitterStrategyController extends OAuthStrategyController(STRATEGY_NAME) {
  constructor (redis: RedisService, @Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    super(redis, logger)
  }
}
```

> `IUser` 仅仅是一个最简单的示例，请随意的按照自己的需要修改吧。

## 第三步，在 [Nest] 中注册 Strategy

[Nest] 要求所有依赖的模块需要提前进行静态的注册，以便运行时通过 IOC 容器进行管理，所以这里我们需要在 `src/auth/auth.module.ts` 中注册通过 `strategyFactory` 创建的 `controller` 和 `strategy` :

```typescript
import { MiddlewareConsumer, Module } from '@nestjs/common'

import { RedirectMiddleware } from './redirect.middleware'
// import 你的 controller 和 strategy
import { TwitterStrategy, TwitterStrategyController } from '../strategies'

@Module({
  providers: [
    // 注册 strategy
    TwitterStrategy,
  ],
  controllers: [
    // 注册 controler
    TwitterStrategyController,
  ]
})
export class AuthModule {
  ...
}
```

这样就完成了你的自定义 Strategy 。
