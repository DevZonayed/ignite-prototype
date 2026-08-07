import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  private readonly allowedVersions: number[];

  /**
   * @param allowedVersions - UUID versions to accept (default: [4])
   */
  constructor(allowedVersions: number[] = [4]) {
    this.allowedVersions = allowedVersions;
  }

  transform(value: string, metadata: ArgumentMetadata): string {
    if (!uuidValidate(value)) {
      throw new BadRequestException(
        `${metadata.data || 'Parameter'} must be a valid UUID`,
      );
    }

    const version = uuidVersion(value);
    if (!this.allowedVersions.includes(version)) {
      throw new BadRequestException(
        `${metadata.data || 'Parameter'} must be a UUID v${this.allowedVersions.join(' or v')}`,
      );
    }

    return value;
  }
}
