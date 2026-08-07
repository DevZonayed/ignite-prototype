import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
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
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Media item created' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() dto: UploadMediaDto,
    @CurrentUser('id') userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.mediaService.upload(dto, userId);
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
