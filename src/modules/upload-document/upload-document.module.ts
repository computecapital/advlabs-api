import { Module } from '@nestjs/common';

import { UploadDocumentService } from './upload-document.service';
import { UploadDocumentController } from './upload-document.controller';

import { S3Service } from 'src/services/s3.service';

@Module({
  controllers: [UploadDocumentController],
  providers: [UploadDocumentService, S3Service],
  exports: [UploadDocumentService],
})
export class UploadDocumentModule {}
