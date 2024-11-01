import { Injectable } from '@nestjs/common';

import { S3Service } from 'src/services/s3.service';
import axios, { AxiosError } from 'axios';

@Injectable()
export class UploadDocumentService {
  constructor(private readonly s3: S3Service) {}

  async uploadDocument(file: Express.Multer.File): Promise<void> {
    try {
      const result = await this.s3.uploadFile(file);

      const fileUrl = await this.s3.getSignedUrl(result.Key);

      console.log('make axios post');

      await axios.post(process.env.LANGFLOW_URL, {
        input_value: 'message',
        output_type: 'text',
        input_type: 'text',
        tweaks: {
          'Upload Document Webhook': {
            url: fileUrl,
          },
        },
      });
    } catch (err) {
      console.log('Upload err', err);

      if (err instanceof AxiosError) {
        console.log(err.response);
      }
    }
  }
}
