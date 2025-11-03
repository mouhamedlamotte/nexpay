import { Test, TestingModule } from '@nestjs/testing';
import { SessionPaymentController } from './session.controller';

describe('SessionController', () => {
  let controller: SessionPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionPaymentController],
    }).compile();

    controller = module.get<SessionPaymentController>(SessionPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
