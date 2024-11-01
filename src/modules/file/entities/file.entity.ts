import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

type FileProps = {
  id: string;
  url: string;
  description: string;
  caseId: string;
  createdAt: Date;
  updatedAt: Date;
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

  constructor(props: FileProps) {
    this.id = props.id;
    this.url = props.url;
    this.description = props.description;
    this.caseId = props.caseId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      url: this.url,
      description: this.description,
      caseId: this.caseId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
