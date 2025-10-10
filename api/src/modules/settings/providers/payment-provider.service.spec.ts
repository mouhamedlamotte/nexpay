import { Test, TestingModule } from '@nestjs/testing';
import { PaymentProviderService } from './payment-provider.service';

describe('PaymentProviderService', () => {
  let service: PaymentProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentProviderService],
    }).compile();

    service = module.get<PaymentProviderService>(PaymentProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
