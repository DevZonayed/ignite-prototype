import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ReadStream } from 'fs';

import {
  MediaLibrary,
  MediaLibraryType,
} from '../../database/entities/media-library.entity';
import { MediaFilterDto } from './dto/media-filter.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { StorageService } from './storage.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaLibrary)
    private readonly mediaRepository: Repository<MediaLibrary>,
    private readonly storage: StorageService,
  ) {}

  async findAll(
    filters: MediaFilterDto,
  ): Promise<{
    data: MediaLibrary[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { type, unitId, page = 1, limit = 20 } = filters;

    const where: FindOptionsWhere<MediaLibrary> = {};
    if (type) where.type = type as unknown as MediaLibraryType;
    if (unitId) where.unitId = unitId;

    const [data, total] = await this.mediaRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<MediaLibrary> {
    const item = await this.mediaRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Media item with ID "${id}" not found`);
    }
    return item;
  }

  /**
   * Store an upload.
   *
   * The file is required: this endpoint used to accept metadata alone and
   * report success, which is how "uploaded" assets ended up with no bytes.
   */
  async upload(
    dto: UploadMediaDto,
    uploadedById: string,
    file?: Express.Multer.File,
  ): Promise<MediaLibrary> {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'No file received. Send the file as multipart/form-data under "file".',
      );
    }

    const fileName = dto.fileName || file.originalname;
    const storageKey = await this.storage.save(file.buffer, fileName);

    const record = this.mediaRepository.create({
      name: dto.name,
      type: dto.type as unknown as MediaLibraryType,
      fileName,
      storageKey,
      mimeType: file.mimetype ?? null,
      sizeBytes: file.size ?? file.buffer.length,
      unitId: dto.unitId,
      uploadedById,
      uploadedAt: new Date(),
    });

    return this.mediaRepository.save(record);
  }

  /** The bytes for a media item, ready to pipe to the client. */
  async openFile(
    id: string,
  ): Promise<{ stream: ReadStream; item: MediaLibrary }> {
    const item = await this.findById(id);
    const stream = item.storageKey ? this.storage.stream(item.storageKey) : null;
    if (!stream) {
      throw new NotFoundException(
        `Media item "${id}" has no stored file. It was uploaded before file storage existed, or the file has been removed.`,
      );
    }
    return { stream, item };
  }

  /** Delete the record and the file behind it. */
  async remove(id: string): Promise<void> {
    const item = await this.findById(id);
    await this.storage.remove(item.storageKey);
    await this.mediaRepository.remove(item);
  }
}
