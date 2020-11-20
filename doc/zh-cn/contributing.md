# 贡献指南

Hi! 很高兴你有兴趣参与到这个项目的迭代中来。我们目前没有太多规矩，请就像在家里一样放松你自己。


## 环境搭建

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

## 配置环境变量

[Nest] 提供了 [dotenv](https://github.com/motdotla/dotenv) 来管理环境变量，并且得益于 [Nest] 支持多 dotenv 文件，所以我们可以在不同环
境使用不同的 dotenv 文件且无需重复不需要覆盖的变量：

- `NODE_ENV === production` 时，dotenv 加载顺序为 `['.env', '.production.env']`
- `NODE_ENV === testing` 时，dotenv 加载顺序为 `['.env', '.testing.env', '.production.env']`
- `NODE_ENV === development` 时，dotenv 加载顺序为 `['.env', '.development.env', '.testing.env', '.production.env']`

> 所有文件都会被加载，靠前的文件里的变量会覆盖靠后的。


## 启动开发模式

```shell
yarn install
yarn start:dev
```

我们推荐使用 yarn 来进行依赖管理，虽然你仍然可以使用 npm ，但是我们需要 `yarn.lock` 来保证 CI 在一致的环境下运行。

> 为什么使用 lockfile： https://yarnpkg.com/getting-started/qa#should-lockfiles-be-committed-to-the-repository


## 代码风格

我们采用一个稍微修改过的 standardjs 标准: https://github.com/BlockABC/eslint-config-blockabc
