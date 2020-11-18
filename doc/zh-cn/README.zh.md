# Web Auth Server

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![unittest](https://github.com/BlockABC/web_auth_server/workflows/unittest/badge.svg)](/BlockABC/web_auth_server/actions)
<a href="https://discord.gg/8WGxH4cgXp"><img src="https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true" alt="Chat"></a>

[README](../../README.md) | [中文文档](README.zh.md)


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


## Documents

- [Contributing Guide](doc/zh-cn/contributing.md)
- [Custom Strategies](doc/zh-cn/custom-strategies.md)

本服务为 [Web Auth Page] 提供了几个 HTTP 协议的 API，文档在启动服务后可以通过 `http://{hostname}/docs` 进行查看，比如服务地址是 http://127.0.0.1:8080 ，那么 API 文档的就位于 http://127.0.0.1:8080/docs 。


## Issues

请随意地前往 [Issues](https://github.com/BlockABC/web_auth_server/issues) 提出你的问题。


## License

[MIT](../../LICENSE)


[Web Auth Page]: https://github.com/BlockABC/web_auth_page/
[Nest]: https://nestjs.com/
[PM2]: https://pm2.keymetrics.io/
