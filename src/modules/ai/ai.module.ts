import { Module } from '@nestjs/common';

import { PrismaService, S3Service } from 'src/services';

import { AIService } from './ai.service';
import { AIController } from './ai.controller';

import { FileModule } from '../file/file.module';
import { ProcessedFileModule } from '../processed-file/processed-file.module';

@Module({
  controllers: [AIController],
  providers: [AIService, S3Service, PrismaService],
  exports: [AIService],
  imports: [FileModule, ProcessedFileModule],
})
export class AIModule {}
