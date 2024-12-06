import { Module } from '@nestjs/common';

import { PrismaService, S3Service } from 'src/services';

import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ProcessedFileService } from '../processed-file/processed-file.service';

@Module({
  controllers: [FileController],
  providers: [FileService, PrismaService, S3Service, ProcessedFileService],
  exports: [FileService],
})
export class FileModule {}
