import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ProcessedFile } from 'src/modules/processed-file/entities/processed-file.entity';

type FileProps = {
  id: string;
  url: string;
  description: string;
  caseId: string;
  createdAt: Date;
  updatedAt: Date;

  processedFiles?: ProcessedFile[];
};

export class File {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  description: string;

  @IsUUID()
  caseId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @IsArray()
  processedFiles?: ProcessedFile[];

  constructor(props: FileProps) {
    this.id = props.id;
    this.url = props.url;
    this.description = props.description;
    this.caseId = props.caseId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.processedFiles = props.processedFiles;
  }

  toJSON() {
    return {
      id: this.id,
      url: this.url,
      description: this.description,
      caseId: this.caseId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      processedFiles: this.processedFiles.map((processedFile) => processedFile.toJSON()),
    };
  }
}
