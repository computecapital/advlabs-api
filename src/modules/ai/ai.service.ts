import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosError } from 'axios';

import { S3Service } from 'src/services/s3.service';
import { PrismaService } from 'src/services';
import { FileService } from '../file/file.service';
import { ProcessedFileService } from '../processed-file/processed-file.service';
import { GenerateSummaryDto } from './dto/generate-summary.dto';

@Injectable()
export class AIService {
  constructor(
    private readonly s3: S3Service,
    private readonly fileService: FileService,
    private readonly processedFileService: ProcessedFileService,
    // TODO: Create modules and use their services instead
    private readonly prisma: PrismaService,
  ) {}

  async uploadDocument(file: Express.Multer.File, description: string): Promise<void> {
    try {
      const result = await this.s3.uploadFile(file);

      const documentUrl = await this.s3.getSignedUrl(result.Key);

      const client = await this.prisma.client.create({
        data: {
          name: `Client for file ${description}`,
        },
      });

      const caseObj = await this.prisma.case.create({
        data: {
          clientId: client.id,
        },
      });

      const createdFile = await this.fileService.create({
        caseId: caseObj.id,
        description,
        url: result.Key,
      });

      const response = await axios.post(`${process.env.AI_API_URL}/upload-document`, {
        documentUrl,
        context: caseObj.id,
      });

      const textData: string[] = response.data.texts;

      let txtContent = '';

      for (let i = 0; i < textData.length; i++) {
        txtContent += '---PAGE---\n';
        txtContent += `${textData[i]}\n`;
      }

      const txtBuffer = Buffer.from(txtContent, 'utf-8');

      const txtFileName = `processed_text_${uuidv4()}.txt`;

      const txtFileResult = await this.s3.uploadBuffer(txtBuffer, txtFileName, 'text/plain');

      await this.processedFileService.create({
        fileId: createdFile.id,
        description: `${description}-transcript`,
        url: txtFileResult.Key,
      });
    } catch (err) {
      console.log('Upload error:', err);

      if (err instanceof AxiosError && err.response) {
        console.log('Axios error response:', err.response.data);
      }
    }
  }

  async generateSummary(generateSummaryDto: GenerateSummaryDto) {
    const { fileId } = generateSummaryDto;

    const processedFiles = await this.processedFileService.findAll({ fileId });

    if (!processedFiles || processedFiles.length === 0) {
      throw new Error('Processed file not found');
    }

    const fileContentBuffer = await this.s3.getFileContent(processedFiles[0].url);
    const fileContent = fileContentBuffer.toString('utf-8');

    const response = await axios.post(`${process.env.AI_API_URL}/generate-summary`, {
      content: fileContent,
    });

    return response.data.summary;
  }
}
