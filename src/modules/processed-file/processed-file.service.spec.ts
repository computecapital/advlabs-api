import { Test, TestingModule } from '@nestjs/testing';

import { ProcessedFileService } from './processed-file.service';

describe('ProcessedFileService', () => {
  let service: ProcessedFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessedFileService],
    }).compile();

    service = module.get<ProcessedFileService>(ProcessedFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
