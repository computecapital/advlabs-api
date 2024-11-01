import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/services';

import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(file: CreateFileDto): Promise<File> {
    const createdFile = await this.prisma.file.create({ data: file });

    return new File(createdFile);
  }

  async findAll(): Promise<File[]> {
    const files = await this.prisma.file.findMany();

    return files.map((file) => new File(file));
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
