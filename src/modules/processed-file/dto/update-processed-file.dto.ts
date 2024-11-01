import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProcessedFileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
