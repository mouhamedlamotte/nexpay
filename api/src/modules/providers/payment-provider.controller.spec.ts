import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersController } from './providers.controller';

describe('PaymentProviderController', () => {
  let controller: ProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
    }).compile();

    controller = module.get<ProvidersController>(
      ProvidersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
