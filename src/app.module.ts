import { Module } from '@nestjs/common';

import { UserModule } from './modules/user/user.module';
import { FileModule } from './modules/file/file.module';
import { ProcessedFileModule } from './modules/processed-file/processed-file.module';
import { AIModule } from './modules/ai/ai.module';

@Module({
  imports: [UserModule, FileModule, ProcessedFileModule, AIModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
