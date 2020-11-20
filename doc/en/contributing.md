# Contributing Guide

Hi! I'm really excited that you are interested in contributing to this project. We don't have too many rules for now, please make yourself at home.


## Development Setup

I recommand to use Docker to maintain a simple local environment, with the help of config file [docker-compose.yml](docker-compose.yml) you can do it in a breeze. But a few preparation works need to be done:

1. [Get Docker](https://docs.docker.com/get-docker/) 。
2. Copy [docker/docker.env](docker/docker.env) to project root directory, and then rename it to `.env`. There are some environment variables in [docker-compose.yml](docker-compose.yml) looks like `${...}`, Docker will try to load them from `.env` by default.
3. `cd web_auth_server`, enter the directory where [docker-compose.yml](docker-compose.yml) exists.

Now, you can start local environment with the following commands:

```shell
# start services
docker-compose up

# stop services
docker-compose stop
```

If need to modify configuration of Redis or MariaDB, please edit the relevant files in the `docker/` directory, then recreate the Docker [containers](https://www.docker.com/resources/what-container)：

```shell
# stop services and remove containers
docker-compose down

# or

# remove stopped containers
docker-compose rm

# at last, start services, containers will be created if not exist
docker-compose up
```

> If you choose this Docker deployment scenario directly in a production environment, be sure to remember to configure the firewall! Stop remote access to port 6379 for Redis and port 3306 for MariaDB, otherwise **you'll be at risk of a data breach!**

## Environment Variables

[Nest] provides [dotenv](https://github.com/motdotla/dotenv) to manage environment variables, and thanks to [Nest]'s
support for multiple dotenv files, we can add different dotenv files for different environments without repeat the same
variables again and again:

- when `NODE_ENV === production`, dotenv loading order is `['.env', '.production.env']`
- when `NODE_ENV === testing`, dotenv loading order is `['.env', '.testing.env', '.production.env']`
- when `NODE_ENV === development`, dotenv loading order is `['.env', '.development.env', '.testing.env', '.production.env']`

> All files will be loaded, variables in earlier files will overwrite later ones.

## Launch Development Mode

```shell
yarn install
yarn start:dev
```

We recommend yarn for dependencies management, although you can still choose npm, but we need `yarn.lock` to provide consistent environment for CI after pushing.

> About why lockfile: https://yarnpkg.com/getting-started/qa#should-lockfiles-be-committed-to-the-repository

## Code Style

We use a little tweaked version of standardjs: https://github.com/BlockABC/eslint-config-blockabc
