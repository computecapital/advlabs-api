import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { S3Service } from 'src/services/s3.service';
import { ProcessedFileService } from 'src/modules/processed-file/processed-file.service';
import { FileUpdatesGateway } from 'src/gateways/file-updates.gateway';

@Processor('reports')
export class ReportsProcessor {
  constructor(
    private readonly s3: S3Service,
    private readonly processedFileService: ProcessedFileService,
    private readonly fileUpdatesGateway: FileUpdatesGateway,
  ) {
    console.log('ReportsProcessor instantiated');
  }

  @Process()
  async handleReport(job: Job) {
    const { transcriptUrl, processedFileId } = job.data;
    console.log('handle report', transcriptUrl);

    try {
      const fileContentBuffer = await this.s3.getFileContent(transcriptUrl);
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
      console.error(err);

      await this.processedFileService.update(processedFileId, { status: 'ERROR' });
      this.fileUpdatesGateway.announceUpdateFiles({
        processedFileId,
        type: 'REPORT',
        status: 'ERROR',
      });
    }
  }
}
