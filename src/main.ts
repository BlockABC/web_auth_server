import { WinstonModule } from 'nest-winston'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { INestApplication, LoggerService, ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

import { configLoader } from './config'
import { ApplicationModule } from './app.module'

const { hostname, port, log, swaggerPath } = configLoader()

function initSwagger (app: INestApplication): void {
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Web Auth Server Docs')
    .setDescription('This is the API document for Web Auth Server.')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerOptions)
  SwaggerModule.setup(swaggerPath, app, document)
}

async function bootstrap () {
  const logger: LoggerService = WinstonModule.createLogger(log)
  const appOptions = {
    cors: true,
    // Use winston logger during bootstrap and the whole app
    logger,
  }
  const app = await NestFactory.create<NestExpressApplication>(ApplicationModule, appOptions)

  app.useGlobalPipes(new ValidationPipe({
    // https://docs.nestjs.com/techniques/validation#disable-detailed-errors
    // disableErrorMessages: true,
  }))

  app.set('trust proxy', 'loopback')
  initSwagger(app)

  await app.listenAsync(port, hostname)
  logger.log(`app is running on http://${hostname}:${port}`)
  logger.log(`api doc is running on http://${hostname}:${port}${swaggerPath}`)
}
bootstrap()
