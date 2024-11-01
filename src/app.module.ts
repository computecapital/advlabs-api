import { Module } from '@nestjs/common';

import { UserModule } from './modules/user/user.module';
import { FileModule } from './modules/file/file.module';
import { ProcessedFileModule } from './modules/processed-file/processed-file.module';
import { UploadDocumentModule } from './modules/upload-document/upload-document.module';

@Module({
  imports: [UserModule, FileModule, ProcessedFileModule, UploadDocumentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
