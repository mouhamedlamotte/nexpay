import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersSeedersService } from './services/providers.seeder.service';

describe('SeedersService', () => {
  let service: ProvidersSeedersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvidersSeedersService],
    }).compile();

    service = module.get<ProvidersSeedersService>(ProvidersSeedersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
