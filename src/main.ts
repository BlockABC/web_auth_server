import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

import { configLoader } from './config'
import { ApplicationModule } from './app.module'

const { hostname, port, log } = configLoader()

const globalPrefix = 'api'

function initSwagger (app: INestApplication): void {
  const swaggerOptions = new DocumentBuilder()
    .setTitle('NestJS Realworld Example App')
    .setDescription('The Realworld API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerOptions)
  SwaggerModule.setup('/docs', app, document)
}

async function bootstrap () {
  const appOptions = {
    cors: true,
    // Use winston logger during bootstrap and the whole app
    logger: WinstonModule.createLogger(log),
  }
  const app = await NestFactory.create<NestExpressApplication>(ApplicationModule, appOptions)

  app.setGlobalPrefix(globalPrefix)
  app.useGlobalPipes(new ValidationPipe({
    // https://docs.nestjs.com/techniques/validation#disable-detailed-errors
    // disableErrorMessages: true,
  }))

  app.set('trust proxy', 'loopback')
  initSwagger(app)

  await app.listenAsync(port, hostname)
  console.log(`app is running on http://${hostname}:${port}/${globalPrefix}`)
}
bootstrap()
