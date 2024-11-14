import { IsUUID } from 'class-validator';

export class GenerateSummaryDto {
  @IsUUID()
  fileId: string;
}
