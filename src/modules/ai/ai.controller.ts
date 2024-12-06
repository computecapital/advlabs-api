import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { AIService } from './ai.service';
import { GenerateSummaryDto } from './dto/generate-summary.dto';

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

  @Post('/generate-summary')
  async generateSummary(@Body() generateSummaryDto: GenerateSummaryDto) {
    return this.aiService.generateSummary(generateSummaryDto);
  }
}
