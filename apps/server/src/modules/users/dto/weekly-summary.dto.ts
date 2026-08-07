import { ApiProperty } from '@nestjs/swagger';

/**
 * Response shape for the weekly summary of a child's activity.
 * Used for Swagger documentation only — not for request validation.
 */
export class WeeklySummaryDto {
  @ApiProperty({ description: 'Number of days the child was present this week', example: 4 })
  daysPresent: number;

  @ApiProperty({ description: 'Number of active projects the child is working on', example: 2 })
  activeProjects: number;

  @ApiProperty({ description: 'Number of new reports generated this week', example: 1 })
  newReports: number;
}
