import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersService } from './providers.service';

describe('PaymentProviderService', () => {
  let service: ProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvidersService],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
