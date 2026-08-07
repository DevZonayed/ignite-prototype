import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateProgressReportDto {
  @ApiPropertyOptional({ description: 'What went well narrative' })
  @IsString()
  @IsOptional()
  whatWentWell?: string;

  @ApiPropertyOptional({ description: 'Skills that are growing', type: [String] })
  @IsArray()
  @IsOptional()
  skillsGrowing?: string[];

  @ApiPropertyOptional({ description: 'Suggested next steps' })
  @IsString()
  @IsOptional()
  nextSteps?: string;
}
