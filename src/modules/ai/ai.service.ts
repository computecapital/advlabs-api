import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosError } from 'axios';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { S3Service } from 'src/services/s3.service';
import { PrismaService } from 'src/services';
import { FileService } from '../file/file.service';
import { ProcessedFileService } from '../processed-file/processed-file.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { File } from '../file/entities/file.entity';
import { FileUpdatesGateway } from 'src/gateways/file-updates.gateway';

@Injectable()
export class AIService {
  constructor(
    private readonly s3: S3Service,
    private readonly fileService: FileService,
    private readonly processedFileService: ProcessedFileService,
    private readonly fileUpdatesGateway: FileUpdatesGateway,
    @InjectQueue('reports') private readonly reportsQueue: Queue,
    // TODO: Create modules and use their services instead
    private readonly prisma: PrismaService,
  ) {}

  async uploadDocument(file: Express.Multer.File, description: string): Promise<File> {
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

      this.readDocument({
        documentUrl,
        caseId: caseObj.id,
        fileId: createdFile.id,
        description,
      });

      return createdFile;
    } catch (err) {
      console.log('Upload error:', err);

      if (err instanceof AxiosError && err.response) {
        console.log('Axios error response:', err.response.data);
      }
    }
  }

  async readDocument({
    documentUrl,
    caseId,
    fileId,
    description,
  }: {
    documentUrl: string;
    caseId: string;
    fileId: string;
    description: string;
  }) {
    const processedFile = await this.processedFileService.create({
      fileId,
      description: `${description}-transcript`,
      type: 'TRANSCRIPT',
      status: 'LOADING',
    });

    try {
      const response = await axios.post(`${process.env.AI_API_URL}/upload-document`, {
        documentUrl,
        context: caseId,
      });

      const textData: string[] = response.data.texts;

      const txtBuffer = Buffer.from(textData.join('\n!!!===PAGE_SEPARATOR===!!!\n'), 'utf-8');

      const txtFileName = `processed_text_${uuidv4()}.txt`;

      const txtFileResult = await this.s3.uploadBuffer(txtBuffer, txtFileName, 'text/plain');

      await this.processedFileService.update(processedFile.id, {
        url: txtFileResult.Key,
        status: 'SUCCESS',
      });

      this.fileUpdatesGateway.announceUpdateFiles({
        processedFileId: processedFile.id,
        type: 'TRANSCRIPT',
        status: 'SUCCESS',
      });
    } catch (err) {
      await this.processedFileService.update(processedFile.id, {
        status: 'ERROR',
      });

      this.fileUpdatesGateway.announceUpdateFiles({
        processedFileId: processedFile.id,
        type: 'TRANSCRIPT',
        status: 'ERROR',
      });
    }
  }

  async generateReport(generateReportDto: GenerateReportDto) {
    const { fileId } = generateReportDto;

    const foundFile = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: { processedFiles: true },
    });

    if (!foundFile) {
      throw new NotFoundException(`File with id '${fileId}' not found`);
    }

    const transcript = foundFile.processedFiles.find(
      ({ type, status }) => type === 'TRANSCRIPT' && status === 'SUCCESS',
    );

    if (!transcript) {
      throw new NotFoundException(`Transcript for file with id '${fileId}' not found`);
    }

    const processedFile = await this.processedFileService.create({
      fileId,
      description: `${foundFile.description}-report`,
      type: 'REPORT',
      status: 'LOADING',
    });

    await this.reportsQueue.add(
      {
        fileId,
        transcriptUrl: transcript.url,
        processedFileId: processedFile.id,
        fileDescription: foundFile.description,
      },
      {
        jobId: fileId,
      },
    );
  }
}
