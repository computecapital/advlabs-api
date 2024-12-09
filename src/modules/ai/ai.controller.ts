import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { AIService } from './ai.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('/upload-document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        description: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
  ) {
    await this.aiService.uploadDocument(file, description);
  }

  @Post('/generate-report')
  async generateReport(@Body() generateReportDto: GenerateReportDto) {
    return this.aiService.generateReport(generateReportDto);
  }
}
