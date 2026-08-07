import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AttendanceStatus } from '../../../database/entities/attendance.entity';

export class AttendanceRecordDto {
  @ApiProperty({ description: 'Learner UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsNotEmpty()
  @IsUUID()
  learnerId: string;

  @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class MarkAttendanceDto {
  @ApiProperty({ description: 'Lesson session UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsNotEmpty()
  @IsUUID()
  lessonSessionId: string;

  @ApiProperty({ description: 'Attendance records for each learner', type: [AttendanceRecordDto] })
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  @ArrayMinSize(1)
  records: AttendanceRecordDto[];
}

export class SaveSessionAttendanceDto {
  @ApiProperty({ description: 'Attendance records for each learner', type: [AttendanceRecordDto] })
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  @ArrayMinSize(1)
  records: AttendanceRecordDto[];
}
