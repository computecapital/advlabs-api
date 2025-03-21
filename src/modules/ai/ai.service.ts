import { Injectable, NotFoundException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { S3Service } from 'src/services/s3.service';
import { PrismaService } from 'src/services';
import { FileService } from '../file/file.service';
import { ProcessedFileService } from '../processed-file/processed-file.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { File } from '../file/entities/file.entity';
import { v4 } from 'uuid';

@Injectable()
export class AIService {
  constructor(
    private readonly s3: S3Service,
    private readonly fileService: FileService,
    private readonly processedFileService: ProcessedFileService,
    @InjectQueue('reports') private readonly reportsQueue: Queue,
    // TODO: Create modules and use their services instead
    private readonly prisma: PrismaService,
  ) {
    this.reportsQueue.on('active', (job) => {
      console.log(`Job ${job.id} is now active`);
    });

    this.reportsQueue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed with result:`, result);
    });

    this.reportsQueue.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed with error:`, err);
    });
  }

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

    await this.reportsQueue.add(
      'readDocument',
      {
        documentUrl,
        caseId,
        processedFileId: processedFile.id,
      },
      {
        jobId: `${fileId}-read-${v4()}`,
      },
    );
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
      'generateReport',
      {
        transcriptUrl: transcript.url,
        processedFileId: processedFile.id,
      },
      {
        jobId: `${fileId}-report-${v4()}`,
      },
    );

    console.log('Job enqueued');
  }
}
