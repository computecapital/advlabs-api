import { Test, TestingModule } from '@nestjs/testing';

import { ProcessedFileController } from './processed-file.controller';
import { ProcessedFileService } from './processed-file.service';

describe('ProcessedFileController', () => {
  let controller: ProcessedFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessedFileController],
      providers: [ProcessedFileService],
    }).compile();

    controller = module.get<ProcessedFileController>(ProcessedFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
