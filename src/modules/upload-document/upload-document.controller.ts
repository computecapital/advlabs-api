import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadDocumentService } from './upload-document.service';

@ApiTags('upload-document')
@ApiBearerAuth()
@Controller('upload-document')
export class UploadDocumentController {
  constructor(private readonly processedFileService: UploadDocumentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    await this.processedFileService.uploadDocument(file);
  }
}
