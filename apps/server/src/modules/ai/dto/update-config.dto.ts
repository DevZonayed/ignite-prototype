import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateConfigDto {
  @ApiPropertyOptional({
    description: 'AI model tier to use',
    enum: ['small', 'large'],
    example: 'small',
  })
  @IsOptional()
  @IsEnum(['small', 'large'])
  modelTier?: 'small' | 'large';

  @ApiPropertyOptional({
    description: 'Whether AI-generated reports require teacher review before publishing',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  requireTeacherReview?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of AI API calls allowed per month',
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyCallCap?: number;
}
