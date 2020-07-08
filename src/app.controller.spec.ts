import { Test } from '@nestjs/testing'
import { WinstonModule } from 'nest-winston'
import { AppController } from './app.controller'
import { configLoader, configModule } from './config'

describe('AppController', () => {
  let controller: AppController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot(configLoader().log),
        configModule,
      ],
      controllers: [AppController],
    }).compile()

    controller = module.get<AppController>(AppController)
  })

  describe('ping', () => {
    it('should return \'pong\'', () => {
      expect(controller.ping()).toBe('pong')
    })
  })
})
