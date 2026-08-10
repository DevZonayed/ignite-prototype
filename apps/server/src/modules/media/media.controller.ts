import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { MediaService } from './media.service';
import { MediaFilterDto } from './dto/media-filter.dto';
import { UploadMediaDto } from './dto/upload-media.dto';

@ApiTags('media')
@ApiBearerAuth('bearer')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'List media library items' })
  @ApiResponse({ status: 200, description: 'Paginated list of media items' })
  async findAll(@Query() filters: MediaFilterDto) {
    return this.mediaService.findAll(filters);
  }

  @Post('upload')
  @Roles('platform_admin', 'curriculum_admin', 'teacher')
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Media item created' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 400, description: 'No file received' })
  async upload(
    @Body() dto: UploadMediaDto,
    @CurrentUser('id') userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.mediaService.upload(dto, userId, file);
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Download the stored file for a media item' })
  @ApiParam({ name: 'id', description: 'Media item UUID' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 404, description: 'Media item or file not found' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { stream, item } = await this.mediaService.openFile(id);
    res.setHeader('Content-Type', item.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${item.fileName || item.name}"`,
    );
    stream.pipe(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media item detail' })
  @ApiParam({ name: 'id', description: 'Media item UUID' })
  @ApiResponse({ status: 200, description: 'Media item details' })
  @ApiResponse({ status: 404, description: 'Media item not found' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Delete(':id')
  @Roles('platform_admin', 'curriculum_admin', 'teacher')
  @ApiOperation({ summary: 'Remove a media item' })
  @ApiParam({ name: 'id', description: 'Media item UUID' })
  @ApiResponse({ status: 200, description: 'Media item removed' })
  @ApiResponse({ status: 404, description: 'Media item not found' })
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
