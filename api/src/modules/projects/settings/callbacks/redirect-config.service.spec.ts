import { Test, TestingModule } from '@nestjs/testing';
import { CallbacksService } from './redirects.service';

describe('RedirectConfigService', () => {
  let service: CallbacksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CallbacksService],
    }).compile();

    service = module.get<CallbacksService>(CallbacksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
