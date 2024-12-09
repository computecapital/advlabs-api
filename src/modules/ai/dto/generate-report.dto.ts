import { IsUUID } from 'class-validator';

export class GenerateReportDto {
  @IsUUID()
  fileId: string;
}
