import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
// import session from 'express-session'
// import MysqlSession from 'express-mysql-session'
import { ApplicationModule } from './app.module'
import abcConfig from '../abc.config'
import config from './config'

async function bootstrap () {
  const appOptions = { cors: true }
  const app = await NestFactory.create<NestExpressApplication>(ApplicationModule, appOptions)

  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({
    // https://docs.nestjs.com/techniques/validation#disable-detailed-errors
    // disableErrorMessages: true,
  }))

  app.set('trust proxy', 'loopback')

  // ------ session start ------
  // const MysqlStore = MysqlSession(session)
  // const mysqlBlockABC = config.mysql.blockabc
  // const sessionStore = new MysqlStore({
  //   host: mysqlBlockABC.host,
  //   port: mysqlBlockABC.port,
  //   user: mysqlBlockABC.username,
  //   password: mysqlBlockABC.password,
  //   database: mysqlBlockABC.database,
  //   connectionLimit: 2,
  // })
  //
  // app.use(
  //   session({
  //     key: 'abcsess',
  //     secret: config.session.secret,
  //     store: sessionStore,
  //     saveUninitialized: false,
  //     resave: false,
  //     cookie: {
  //       maxAge: 1000 * 60 * 60 * 24 * 7,
  //     }
  //   })
  // )
  // ------ session end ------

  const swaggerOptions = new DocumentBuilder()
    .setTitle('NestJS Realworld Example App')
    .setDescription('The Realworld API description')
    .setVersion('1.0')
    .setBasePath('api')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerOptions)
  SwaggerModule.setup('/docs', app, document)

  await app.listen(abcConfig.port).then(res => {
    console.log(`app is running on port ${abcConfig.port}`, `http://127.0.0.1:${abcConfig.port}/api`)
  })
}
bootstrap()
