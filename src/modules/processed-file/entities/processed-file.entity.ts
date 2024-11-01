import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

type ProcessedFileProps = {
  id: string;
  url: string;
  description: string;
  fileId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ProcessedFile {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  url: string;

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
    this.description = props.description;
    this.fileId = props.fileId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      url: this.url,
      description: this.description,
      fileId: this.fileId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
