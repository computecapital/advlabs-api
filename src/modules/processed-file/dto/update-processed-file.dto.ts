import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  ProcessedFileStatusENUM,
  ProcessedFileStatusUnion,
  ProcessedFileTypeENUM,
  ProcessedFileTypeUnion,
} from '../entities/processed-file.entity';

export class UpdateProcessedFileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  url?: string;

  @IsOptional()
  @IsEnum(ProcessedFileTypeENUM)
  type?: ProcessedFileTypeUnion;

  @IsOptional()
  @IsEnum(ProcessedFileStatusENUM)
  status?: ProcessedFileStatusUnion;

  @IsOptional()
  @IsString()
  description?: string;
}
