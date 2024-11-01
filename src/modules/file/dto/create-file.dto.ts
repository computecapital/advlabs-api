import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  description: string;

  @IsUUID()
  caseId: string;
}
