import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateProcessedFileDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  description: string;

  @IsUUID()
  fileId: string;
}
