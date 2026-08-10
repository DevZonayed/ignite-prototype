import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MediaLibrary } from '../../database/entities/media-library.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaLibrary])],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
