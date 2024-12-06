import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService, S3Service } from 'src/services';

import { CreateProcessedFileDto } from './dto/create-processed-file.dto';
import { UpdateProcessedFileDto } from './dto/update-processed-file.dto';
import { ProcessedFile } from './entities/processed-file.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProcessedFileService {
  constructor(
    private readonly s3: S3Service,
    private readonly prisma: PrismaService,
  ) {}

  async create(processedFile: CreateProcessedFileDto): Promise<ProcessedFile> {
    const createdProcessedFile = await this.prisma.processedFile.create({ data: processedFile });

    return new ProcessedFile(createdProcessedFile);
  }

  async findAll(where?: Prisma.ProcessedFileWhereInput): Promise<ProcessedFile[]> {
    const processedFiles = await this.prisma.processedFile.findMany({ where });

    return processedFiles.map((processedFile) => new ProcessedFile(processedFile));
  }

  async getDownloadURL(id: string): Promise<string> {
    const foundProcessedFile = await this.prisma.processedFile.findUnique({ where: { id } });

    if (!foundProcessedFile) throw new NotFoundException(`ProcessedFile with id '${id}' not found`);

    const url = await this.s3.getSignedUrl(foundProcessedFile.url);

    return url;
  }

  async findOne(id: string): Promise<ProcessedFile> {
    const foundProcessedFile = await this.prisma.processedFile.findUnique({ where: { id } });

    if (!foundProcessedFile) throw new NotFoundException(`ProcessedFile with id '${id}' not found`);

    return new ProcessedFile(foundProcessedFile);
  }

  async update(id: string, data: UpdateProcessedFileDto): Promise<ProcessedFile> {
    const foundProcessedFile = await this.prisma.processedFile.findUnique({ where: { id } });

    if (!foundProcessedFile) throw new NotFoundException(`ProcessedFile with id '${id}' not found`);

    const updatedProcessedFile = await this.prisma.processedFile.update({ where: { id }, data });

    return new ProcessedFile(updatedProcessedFile);
  }

  async remove(id: string): Promise<void> {
    const processedFile = await this.prisma.processedFile.findUnique({ where: { id } });

    if (!processedFile) throw new NotFoundException(`ProcessedFile with id '${id}' not found`);

    await this.prisma.processedFile.delete({ where: { id } });
  }
}
