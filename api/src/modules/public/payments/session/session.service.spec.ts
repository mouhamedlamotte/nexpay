import { Test, TestingModule } from '@nestjs/testing';
import { SessionPayemtService } from './session.service';

describe('SessionService', () => {
  let service: SessionPayemtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionPayemtService],
    }).compile();

    service = module.get<SessionPayemtService>(SessionPayemtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
