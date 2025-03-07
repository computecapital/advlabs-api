import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { PrismaService, S3Service } from 'src/services';

import { AIService } from './ai.service';
import { AIController } from './ai.controller';

import { FileModule } from '../file/file.module';
import { ProcessedFileModule } from '../processed-file/processed-file.module';
import { FileUpdatesGateway } from 'src/gateways/file-updates.gateway';
import { ReportsProcessor } from 'src/processors/reports.processor';

@Module({
  imports: [
    FileModule,
    ProcessedFileModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'reports',
    }),
  ],
  controllers: [AIController],
  providers: [AIService, S3Service, PrismaService, FileUpdatesGateway, ReportsProcessor],
  exports: [AIService],
})
export class AIModule {}
