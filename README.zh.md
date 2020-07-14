# Web Auth Server

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[README](README.md) | [中文文档](README.zh.md)


## Introduction

Web Auth Server 是 Web Auth 框架的服务端，必须配合 [Web Auth Page] 一起使用。Web Auth Server 利用 [Nest] 框架提供了方便接入各种 OAuth 平台的接口，并带有完善的日志、缓存、数据库服务，你将能够方便的在这套框架上进行扩展。当然，它还内置了一个开箱即用的 twitter 平台接入方案。


## Getting started

### 环境搭建

你需要在环境中搭建以下服务，并确认它们运行正常：

- Redis
- Mysql or MariaDB
- Nodejs

如果你不熟悉 Redis, MySQL, MariaDB 这些后端服务，并且你还不准备雇佣专业的技术人员来部署它们，那请参见 [Development > 环境搭建](#development) 一节，本框架提供了了一个基于 Docker 的快速解决方案，这种部署方式适用于实验性的、较小规模的应用，你可以通过简单的提升单一服务器配置来提高负载上限。

Nodejs 的安装方式详见官方文档: https://nodejs.org/en/download/package-manager

### 配置环境变量

你可以通过任何熟悉的方式来配置环境变量，比如 CI 和 [PM2] 都有自己的环境变量配置方式，除此以外可以使用 [Nest] 提供的 [dotenv](https://github.com/motdotla/dotenv) 配置方式。

### 启动服务

```shell
npm install --only=prod
npm run start
```

> 这只是最简单的启动服务的方式，我们更推荐使用 [PM2] 以 cluster 模式启动并管理生产环境中的进程。


## API

本服务为 [Web Auth Page] 提供了几个 HTTP 协议的 API，文档在启动服务后可以通过 `http://{hostname}/docs` 进行查看，比如服务地址是 http://127.0.0.1:8080 ，那么 API 文档的就位于 http://127.0.0.1:8080/docs 。


## 扩充自定义 Strategy

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
|  Nest Strategy  |
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

### 第一步，添加配置

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

### 第二步，创建 Strategy

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

### 第三步，在 [Nest] 中注册 Strategy

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


## Development

### 环境搭建

我推荐使用 Docker 来维护一个简单的本地环境，借助 [docker-compose.yml](docker-compose.yml) 配置文件它能帮你立即做到这点。想要使用 Docker 我们首先需要完成以下几个准备工作：

1. [安装 Docker](https://docs.docker.com/get-docker/) 。
2. [docker-compose.yml](docker-compose.yml) 中有一些类似 `${...}` 的环境变量可以配置，我们需要将 [docker/docker.env](docker/docker.env) 复制粘贴到项目根目录下的 `.env` 中，docker 会自动从其中获取
环境变量。
3. `cd web_auth_server` 进入 [docker-compose.yml](docker-compose.yml) 所在的目录。

现在，你就可以使用下面命令来启动本地环境了：

```shell
# 启动服务
docker-compose up

# 停止服务
docker-compose stop
```

如果你需要修改 Redis 或 MariaDB 的配置，请编辑 `docker/` 目录下的相关文件并保存，然后你需要重新创建 Docker [容器](https://www.docker.com/resources/what-container)：

```shell
# 停止服务并删除容器
docker-compose down

# 或

# 删除已停止的容器
docker-compose rm

# 最后，启动服务，当容器不存在时会自动创建容器
docker-compose up
```

> 如果你在生产环境直接使用这个 Docker 部署方案，请务必记得配置防火墙！禁止远程访问 Redis 的 6379 端口和 MariaDB 的 3306 端口，否则**你将面对数据泄漏的风险！**

### 配置环境变量

[Nest] 提供了 [dotenv](https://github.com/motdotla/dotenv) 来管理环境变量，并且得益于 [Nest] 支持多 dotenv 文件，所以我们可以在不同环
境使用不同的 dotenv 文件且无需重复不需要覆盖的变量：

- `NODE_ENV === production` 时，dotenv 加载顺序为 `['.env', '.production.env']`
- `NODE_ENV === testing` 时，dotenv 加载顺序为 `['.env', '.testing.env', '.production.env']`
- `NODE_ENV === development` 时，dotenv 加载顺序为 `['.env', '.development.env', '.testing.env', '.production.env']`

> 所有文件都会被加载，靠前的文件里的变量会覆盖靠后的。

### 启动开发模式

```shell
npm install
npm run start:dev
```

### 代码风格

我们采用一个稍微修改过的 standardjs 标准: https://github.com/BlockABC/eslint-config-blockabc


## Issues

请随意地前往 [Issues](https://github.com/BlockABC/web_auth_server/issues) 提出你的问题。


## License

[MIT](LICENSE)


[Web Auth Page]: https://github.com/BlockABC/web_auth_page/
[Nest]: https://nestjs.com/
[PM2]: https://pm2.keymetrics.io/
