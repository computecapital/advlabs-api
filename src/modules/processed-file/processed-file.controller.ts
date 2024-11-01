import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ProcessedFileService } from './processed-file.service';
import { CreateProcessedFileDto } from './dto/create-processed-file.dto';
import { UpdateProcessedFileDto } from './dto/update-processed-file.dto';

@ApiTags('processed-files')
@ApiBearerAuth()
@Controller('processed-files')
export class ProcessedFileController {
  constructor(private readonly processedFileService: ProcessedFileService) {}

  @Post()
  async create(@Body() createProcessedFileDto: CreateProcessedFileDto) {
    const createdProcessedFile = await this.processedFileService.create(createProcessedFileDto);

    return createdProcessedFile.toJSON();
  }

  @Get()
  async findAll() {
    const processedFiles = await this.processedFileService.findAll();

    return processedFiles.map((processedFile) => processedFile.toJSON());
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const processedFile = await this.processedFileService.findOne(id);

    return processedFile.toJSON();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProcessedFileDto: UpdateProcessedFileDto) {
    const updatedProcessedFile = await this.processedFileService.update(id, updateProcessedFileDto);

    return updatedProcessedFile.toJSON();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.processedFileService.remove(id);
  }
}
