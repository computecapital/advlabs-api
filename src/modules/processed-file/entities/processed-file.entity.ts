import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ProcessedFileTypeENUM {
  TRANSCRIPT = 'TRANSCRIPT',
  REPORT = 'REPORT',
}

export type ProcessedFileTypeUnion = `${ProcessedFileTypeENUM}`;

export enum ProcessedFileStatusENUM {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export type ProcessedFileStatusUnion = `${ProcessedFileStatusENUM}`;

type ProcessedFileProps = {
  id: string;
  url?: string;
  type: ProcessedFileTypeUnion;
  status: ProcessedFileStatusUnion;
  description: string;
  fileId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ProcessedFile {
  @IsUUID()
  id: string;

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

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  constructor(props: ProcessedFileProps) {
    this.id = props.id;
    this.url = props.url;
    this.type = props.type;
    this.status = props.status;
    this.description = props.description;
    this.fileId = props.fileId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      url: this.url,
      type: this.type,
      status: this.status,
      description: this.description,
      fileId: this.fileId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
