# Custom Strategies

First of all, please look at the following picture:

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

This framework actually leverages the **Strategy** concept and interface in [passportjs](http://www.passportjs.org/), so customizing **Strategy** is actually calling **Strategy** in passportjs. This makes it easy for users to support [500+ of Strategy](http://www.passportjs.org/packages/), which includes community like Facebook, Google, Reddit, Github, Wechat, and more!

Next, let's look at how to expand your own Strategy:

## First step, add configuration

We need to add ApiKey, ApiSecret and other information in `src/config.ts` to customize the strategy, what we actually needed could be found from document of passportjs strategies. For example, I find three required params from document of [passport-twitter](https://github.com/jaredhanson/passport-twitter):

- consumerKey
- consumerSecret
- callbackURL

So we add the following keys to `src/config.ts`:

```typescript
export interface Config {
  ... // some other code

  // type declaration
  twitter: {
    consumerKey: string,
    consumerSecret: string,
    callbackURL: string,
  },
}

export function configLoader (): Config {
  return {
    ... // some other code

    // twitter strategy params
    twitter: { // this key is the global name of strategy, I will name it to strategyName in code below
      consumerKey: process.env.TWITTER_API_KEY, // assign actual value from process.env
      consumerSecret: process.env.TWITTER_API_SECRET,
      callbackURL: '/auth/twitter' // callback url will be `config.baseUrl + config.twitter.callbackURL`
    }
  }
}
```

## Second step，create strategy

You need to create directory of your strategy in `src/strategies`, the name of directory should be the same as
strategy's name, and two files in the directory：

The first is `{name}.strategy.ts`：

```typescript
// import the passportjs strategy you want, the passport-twitter here is an example
import { Profile, Strategy } from 'passport-twitter'
// More other imports ...

// Strategy name, must be the same as src/config.ts
export const STRATEGY_NAME = 'twitter'

// OAuthStrategy is a base class generator from `src/strategies/common`
@Injectable()
export class TwitterStrategy extends OAuthStrategy(Strategy, STRATEGY_NAME) {
  constructor (config: ConfigService, @Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    super(config, logger)
  }

  // customize your verify callback, must return a user object contains data what frontend expected
  async validate (accessToken: string, accessTokenSecret: string, profile: Profile, done: (error: any, user?: any) => void): Promise<IUser> {
    // construct your user object, if you want it to be abstruct you can implement IUser interface
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

The second is `{name}.strategy.controller.ts`:

```typescript
// This controller is mainly for define the OAuth callback route
@Controller(`auth/${STRATEGY_NAME}`)
export class TwitterStrategyController extends OAuthStrategyController(STRATEGY_NAME) {
  constructor (redis: RedisService, @Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    super(redis, logger)
  }
}
```

> `IUser` is only a simple example, feel free to modify it to what you want.

## Step 3，register Strategy in [Nest]

[Nest] requires all dependent modules to be registered statically in advance for runtime management through the IOC container, so here we need to register the `controller` and `strategy` created by `strategyFactory` in `src/auth/auth.module.ts` :

```typescript
import { MiddlewareConsumer, Module } from '@nestjs/common'

import { RedirectMiddleware } from './redirect.middleware'
// import your controller and strategy
import { TwitterStrategy, TwitterStrategyController } from '../strategies/twitter.strategy'

@Module({
  providers: [
    // register strategy
    TwitterStrategy,
  ],
  controllers: [
    // register controler
    TwitterStrategyController,
  ]
})
export class AuthModule {
  ...
}
```

That is all.
