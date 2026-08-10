import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSchoolDto } from './create-school.dto';

/**
 * Everything on CreateSchoolDto except `principal`: the principal account is
 * created once, alongside the school. Changing who runs a school is done from
 * the Users screen, not by editing the school record.
 */
export class UpdateSchoolDto extends PartialType(
  OmitType(CreateSchoolDto, ['principal'] as const),
) {}
