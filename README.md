# Web Auth Server

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[README](README.md) | [中文文档](README.zh.md)


## Introduction

Web Auth Server is a server side framework and must be used in conjunction with Web Auth Page. Web Auth Server is base on nestjs framework, it provides easy access to a variety of OAuth platforms, with comprehensive logging, caching, database services, you will be able to easily extend on this framework. Of course, it also has a built-in stategy for twitter.


## Getting started

### Environment Build

You need to set up the following services in the environment and make sure they are working properly:

- Redis
- Mysql or MariaDB

If you are not familiar with these two backend services and you are not ready to hire professional programers to deploy them, then see the section [Development > Environment Build](#development), I provide a out-of-the-box Docker solution that is suitable for experimental, smaller scale applications where you can increase the load limit by simply boosting a single server resources.

### Launch Service

The service can be launched in a few simple steps:

```shell
git clone https://github.com/BlockABC/web_auth_server.git

cp .env.example .env

# Configure the environment variables in the .env file according to your server environment
vim .env

npm run start

# Or

yarn start
```


## Extending Strategies

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
|  Nestjs Strategy  |
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

### First step, add configuration

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

### Second step，create strategy

You need to create `{name}.strategy.ts` in `src/strategies` directory：

```typescript
// import the passportjs strategy you want, the passport-twitter here is an example
import { Profile, Strategy } from 'passport-twitter'

// import `strategyFactory` method to help you create controller class and strategy class
import { strategyFactory } from './factory'
import { IOAuthStrategy, IUser } from './interface'

export const {
  // strategyFactory will always return an object contains a controller class and a strategy class, here I rename them with destructuring
  controller: TwitterStrategyController,
  strategy: TwitterStrategy,
} = strategyFactory({
  // strategy name, must be the same as src/config.ts
  strategyName: 'twitter',
  // pass into the strategy class you choosed from passportjs
  passportStrategyClass: Strategy,
  // customize your verify callback, must return a user object contains data what frontend expected
  validateFunc: async function (this: IOAuthStrategy, accessToken: string, accessTokenSecret: string, profile: Profile, done: (error: any, user?: any) => void): Promise<IUser> {
    // construct your user object, if you want it to be abstruct you can implement IUser interface
    return user
  }
})
```

> `IUser` is only a simple example, feel free to modify it to what you want.

### Step 3，register Strategy in nestjs

Nestjs requires all dependent modules to be registered statically in advance for runtime management through the IOC container, so here we need to register the `controller` and `strategy` created by `strategyFactory` in `src/auth/auth.module.ts` :

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


## Development

### Environment Build

I recommand to use Docker to maintain a simple local environment, this project contains a [docker-compose.yml](docker-compose.yml) configuration file, after installing Docker you can simply start/stop the services using the following commands：

```shell
git clone https://github.com/BlockABC/web_auth_server.git
cd web_auth_server

# start services
docker-compose up

# stop services
docker-compose stop
```

If need to modify configuration of Redis or MariaDB, please edit the relevant files in the `docker/` directory, then recreate the Docker [containers](https://www.docker.com/resources/what-container)：

```shell
# stop services and remove containers
docker-compose down

# Or

# remove stopped containers
docker-compose rm

# at last, start services, containers will be created if not exist
docker-compose up
```

> If you choose this Docker deployment scenario directly in a production environment, be sure to remember to configure the firewall! Stop remote access to port 6379 for Redis and port 3306 for MariaDB, otherwise **you'll be at risk of a data breach!**

### Code Style

We use a little tweaked version of standardjs: https://github.com/BlockABC/eslint-config-blockabc


## Issues

Please feel free to submit your questions at [Issure](https://github.com/BlockABC/web_auth_server/issues).


## License

[MIT](LICENSE)
