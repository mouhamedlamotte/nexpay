import { Test, TestingModule } from '@nestjs/testing';
import { CallbacksController } from './redirects.controller';

describe('RedirectConfigController', () => {
  let controller: CallbacksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallbacksController],
    }).compile();

    controller = module.get<CallbacksController>(CallbacksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
