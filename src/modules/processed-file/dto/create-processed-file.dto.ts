import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  ProcessedFileStatusENUM,
  ProcessedFileStatusUnion,
  ProcessedFileTypeENUM,
  ProcessedFileTypeUnion,
} from '../entities/processed-file.entity';

export class CreateProcessedFileDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsEnum(ProcessedFileTypeENUM)
  type: ProcessedFileTypeUnion;

  @IsEnum(ProcessedFileStatusENUM)
  status: ProcessedFileStatusUnion;

  @IsString()
  description: string;

  @IsUUID()
  fileId: string;
}
