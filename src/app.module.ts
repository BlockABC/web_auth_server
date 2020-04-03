import { Module, NestModule, MiddlewareConsumer, CacheModule } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
  ],
  providers: [
  ],
  exports: [
  ]
})
export class ApplicationModule {
}
