import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<S3.ManagedUpload.SendData> {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    return this.s3.upload(params).promise();
  }

  async getSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Expires: expiresIn,
    };

    return this.s3.getSignedUrl('getObject', params);
  }
}
