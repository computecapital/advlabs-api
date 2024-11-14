import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosError } from 'axios';

import { S3Service } from 'src/services/s3.service';
import { FileService } from '../file/file.service';
import { ProcessedFileService } from '../processed-file/processed-file.service';
import { GenerateSummaryDto } from './dto/generate-summary.dto';

@Injectable()
export class AIService {
  constructor(
    private readonly s3: S3Service,
    private readonly fileService: FileService,
    private readonly processedFileService: ProcessedFileService,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    caseId: string,
    description: string,
  ): Promise<void> {
    try {
      const result = await this.s3.uploadFile(file);

      const documentUrl = await this.s3.getSignedUrl(result.Key);

      const response = await axios.post(`${process.env.AI_API_URL}/upload-document`, {
        documentUrl,
        context: caseId,
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

      const createdFile = await this.fileService.create({
        caseId,
        description,
        url: result.Key,
      });

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
