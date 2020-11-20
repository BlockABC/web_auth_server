# Web Auth Server

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![unittest](https://github.com/BlockABC/web_auth_server/workflows/unittest/badge.svg)](/BlockABC/web_auth_server/actions)
<a href="https://discord.gg/8WGxH4cgXp"><img src="https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true" alt="Chat"></a>

[README](README.md) | [中文文档](doc/zh-cn/README.zh.md)


## Introduction

Web Auth Server is a server side framework and must be used in conjunction with [Web Auth Page]. Web Auth Server is base on [Nest] framework, it provides easy access to a variety of OAuth platforms, with comprehensive logging, caching, database services, you will be able to easily extend on this framework. Of course, it also has a built-in stategy for twitter.


## Quick start

### Environment Construction

You need to set up the following services in the environment and make sure they are working properly:

- Redis
- Mysql or MariaDB
- Nodejs

If you are not familiar with Redis, MySQL, MariaDB and you are not ready to hire professional programers to deploy them, then see the section [Development > Environment Build](#development), I provide a out-of-the-box Docker solution that is suitable for experimental, smaller scale applications where you can increase the load limit by simply boosting a single server resources.

Please go to official document for how to install Nodejs: https://nodejs.org/en/download/package-manager

### Environment Variables

You can configure environment variables in any familiar way, such as CI and [PM2] both have their own environment variable configuration methods, except that you can use [dotenv](https://github.com/motdotla/dotenv) provided by [Nest].

### Launch Service

```shell
npm install --only=prod
npm run start
```

> This is only the simplest way to start a service, and we prefer to use cluster mode of [PM2] to start and manage processes in a production environment.


## Document

- [Contributing Guide](doc/en/contributing.md)
- [Custom Strategies](doc/en/custom-strategies.md)

The service provides several HTTP protocol API for [Web Auth Page], and the documentation can be viewed at `http://{hostname}/docs` after starting the service, for example the default service address is http://127.0.0.1:8080, then the API documentation is located at http://127.0.0.1:8080/docs.


## Issues

Please feel free to submit your questions at [Issues](https://github.com/BlockABC/web_auth_server/issues).


## License

[MIT](LICENSE)


[Web Auth Page]: https://github.com/BlockABC/web_auth_page/
[Nest]: https://nestjs.com/
[PM2]: https://pm2.keymetrics.io/
