import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  async create(@Body() createFileDto: CreateFileDto) {
    const createdFile = await this.fileService.create(createFileDto);

    return createdFile.toJSON();
  }

  @Get()
  async findAll() {
    const files = await this.fileService.findAll();

    return files.map((file) => file.toJSON());
  }

  @Get('download/:id')
  async download(@Param('id') id: string) {
    const fileUrl = await this.fileService.getDownloadURL(id);

    return fileUrl;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const file = await this.fileService.findOne(id);

    return file.toJSON();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    const updatedFile = await this.fileService.update(id, updateFileDto);

    return updatedFile.toJSON();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(id);
  }
}
