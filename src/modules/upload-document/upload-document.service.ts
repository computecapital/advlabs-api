import { Injectable } from '@nestjs/common';

import { S3Service } from 'src/services/s3.service';
import axios from 'axios';

@Injectable()
export class UploadDocumentService {
  constructor(private readonly s3: S3Service) {}

  async uploadDocument(file: Express.Multer.File): Promise<void> {
    const result = await this.s3.uploadFile(file);

    const fileUrl = await this.s3.getSignedUrl(result.Key);

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
  }
}
