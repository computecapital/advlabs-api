import { Module } from '@nestjs/common';

import { PrismaService, S3Service } from 'src/services';

import { ProcessedFileService } from './processed-file.service';
import { ProcessedFileController } from './processed-file.controller';

@Module({
  controllers: [ProcessedFileController],
  providers: [ProcessedFileService, PrismaService, S3Service],
  exports: [ProcessedFileService],
})
export class ProcessedFileModule {}
