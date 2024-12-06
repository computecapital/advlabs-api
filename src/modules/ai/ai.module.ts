import { Module } from '@nestjs/common';

import { AIService } from './ai.service';
import { AIController } from './ai.controller';

import { S3Service } from 'src/services/s3.service';
import { FileModule } from '../file/file.module';
import { ProcessedFileModule } from '../processed-file/processed-file.module';
import { PrismaService } from 'src/services';

@Module({
  controllers: [AIController],
  providers: [AIService, S3Service, PrismaService],
  exports: [AIService],
  imports: [FileModule, ProcessedFileModule],
})
export class AIModule {}
