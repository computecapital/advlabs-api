import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { S3Service } from 'src/services/s3.service';
import { ProcessedFileService } from 'src/modules/processed-file/processed-file.service';
import { FileUpdatesGateway } from 'src/gateways/file-updates.gateway';
import { PrismaService } from 'src/services';

@Processor('reports')
export class ReportsProcessor {
  constructor(
    private readonly s3: S3Service,
    private readonly processedFileService: ProcessedFileService,
    private readonly fileUpdatesGateway: FileUpdatesGateway,
    private readonly prisma: PrismaService,
  ) {}

  async handleGenerateReport(job: Job) {
    console.log('handleGenerateReport called with job data:', job.data);
    try {
      const { transcriptUrl, processedFileId, fileId } = job.data;

      let documentUrl = transcriptUrl;

      if (!documentUrl) {
        const foundFile = await this.prisma.file.findUnique({
          where: { id: fileId },
          include: { processedFiles: true },
        });

        const transcript = foundFile.processedFiles.find(
          ({ type, status }) => type === 'TRANSCRIPT' && status === 'SUCCESS',
        );

        if (!transcript) {
          throw new Error('Transcript read attempt failed');
        }

        documentUrl = transcript.url;
      }

      const fileContentBuffer = await this.s3.getFileContent(documentUrl);
      const fileContent = fileContentBuffer.toString('utf-8');
      const pageContents = fileContent.split('\n!!!===PAGE_SEPARATOR===!!!\n');

      const response = await axios.post(
        `${process.env.AI_API_URL}/generate-adv-report`,
        { texts: pageContents },
        { responseType: 'arraybuffer' },
      );

      const pdfBuffer = Buffer.from(response.data);
      const pdfFileName = `summary_${uuidv4()}.pdf`;
      const pdfFileResult = await this.s3.uploadBuffer(pdfBuffer, pdfFileName, 'application/pdf');

      await this.processedFileService.update(processedFileId, {
        url: pdfFileResult.Key,
        status: 'SUCCESS',
      });

      this.fileUpdatesGateway.announceUpdateFiles({
        processedFileId,
        type: 'REPORT',
        status: 'SUCCESS',
      });
    } catch (err) {
      console.error('Error in generateReport job:', err);
      await this.processedFileService.update(job.data.processedFileId, { status: 'ERROR' });
      this.fileUpdatesGateway.announceUpdateFiles({
        processedFileId: job.data.processedFileId,
        type: 'REPORT',
        status: 'ERROR',
      });
    }
  }

  async handleReadDocument(job: Job) {
    console.log('handleReadDocument called with job data:', job.data);
    try {
      const { fileKey, caseId, processedFileId } = job.data;

      const documentUrl = await this.s3.getSignedUrl(fileKey);

      const response = await axios.post(`${process.env.AI_API_URL}/upload-document`, {
        documentUrl,
        context: caseId,
      });

      const textData: string[] = response.data.texts;
      const txtBuffer = Buffer.from(textData.join('\n!!!===PAGE_SEPARATOR===!!!\n'), 'utf-8');
      const txtFileName = `processed_text_${uuidv4()}.txt`;
      const txtFileResult = await this.s3.uploadBuffer(txtBuffer, txtFileName, 'text/plain');

      await this.processedFileService.update(processedFileId, {
        url: txtFileResult.Key,
        status: 'SUCCESS',
      });

      this.fileUpdatesGateway.announceUpdateFiles({
        processedFileId,
        type: 'TRANSCRIPT',
        status: 'SUCCESS',
      });
    } catch (err) {
      console.error('Error in readDocument job:', err);
      await this.processedFileService.update(job.data.processedFileId, {
        status: 'ERROR',
      });

      this.fileUpdatesGateway.announceUpdateFiles({
        processedFileId: job.data.processedFileId,
        type: 'TRANSCRIPT',
        status: 'ERROR',
      });
    }
  }

  @Process({ concurrency: 1 })
  async mainProcess(job: Job) {
    switch (job.data.type) {
      case 'readDocument':
        await this.handleReadDocument(job);
        break;
      case 'generateReport':
        await this.handleGenerateReport(job);
        break;
    }
  }
}
