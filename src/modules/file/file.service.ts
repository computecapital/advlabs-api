import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService, S3Service } from 'src/services';

import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './entities/file.entity';
import { ProcessedFile } from '../processed-file/entities/processed-file.entity';

@Injectable()
export class FileService {
  constructor(
    private readonly s3: S3Service,
    private readonly prisma: PrismaService,
  ) {}

  async create(file: CreateFileDto): Promise<File> {
    const createdFile = await this.prisma.file.create({ data: file });

    return new File(createdFile);
  }

  async findAll(): Promise<File[]> {
    const files = await this.prisma.file.findMany({ include: { processedFiles: true } });

    return files.map(({ processedFiles, ...file }) => {
      const processedFilesEntities = processedFiles.map(
        (processedFile) => new ProcessedFile(processedFile),
      );

      return new File({ ...file, processedFiles: processedFilesEntities });
    });
  }

  async getDownloadURL(id: string): Promise<string> {
    const foundFile = await this.prisma.file.findUnique({ where: { id } });

    if (!foundFile) throw new NotFoundException(`File with id '${id}' not found`);

    const url = await this.s3.getSignedUrl(foundFile.url);

    return url;
  }

  async getRawDownloadURL(id: string): Promise<string> {
    const foundFile = await this.prisma.file.findUnique({ where: { id } });

    if (!foundFile) throw new NotFoundException(`File with id '${id}' not found`);

    const processedFile = await this.prisma.processedFile.findFirst({
      where: { fileId: foundFile.id },
    });

    if (!processedFile)
      throw new NotFoundException(`ProcessedFile for File with id '${id}' not found`);

    const url = await this.s3.getSignedUrl(processedFile.url);

    return url;
  }

  async findOne(id: string): Promise<File> {
    const foundFile = await this.prisma.file.findUnique({ where: { id } });

    if (!foundFile) throw new NotFoundException(`File with id '${id}' not found`);

    return new File(foundFile);
  }

  async update(id: string, data: UpdateFileDto): Promise<File> {
    const foundFile = await this.prisma.file.findUnique({ where: { id } });

    if (!foundFile) throw new NotFoundException(`File with id '${id}' not found`);

    const updatedFile = await this.prisma.file.update({ where: { id }, data });

    return new File(updatedFile);
  }

  async remove(id: string): Promise<void> {
    const file = await this.prisma.file.findUnique({ where: { id } });

    if (!file) throw new NotFoundException(`File with id '${id}' not found`);

    await this.prisma.file.delete({ where: { id } });
  }
}
