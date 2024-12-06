import { Module } from '@nestjs/common';

import { PrismaService, S3Service } from 'src/services';

import { FileService } from './file.service';
import { FileController } from './file.controller';

@Module({
  controllers: [FileController],
  providers: [FileService, PrismaService, S3Service],
  exports: [FileService],
})
export class FileModule {}
