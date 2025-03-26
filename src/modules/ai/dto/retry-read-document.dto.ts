import { IsUUID } from 'class-validator';

export class RetryReadDocumentDto {
  @IsUUID()
  fileId: string;
}
