import { Module } from '@nestjs/common';

import { PrismaService } from 'src/services';

import { ProcessedFileService } from './processed-file.service';
import { ProcessedFileController } from './processed-file.controller';

@Module({
  controllers: [ProcessedFileController],
  providers: [ProcessedFileService, PrismaService],
  exports: [ProcessedFileService],
})
export class ProcessedFileModule {}
