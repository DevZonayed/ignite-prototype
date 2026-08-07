import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title', example: 'Introduction to Sensors' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Display order within the unit', example: 1 })
  @IsInt()
  @Min(0)
  order: number;

  @ApiPropertyOptional({ description: 'Programme name' })
  @IsOptional()
  @IsString()
  programme?: string;

  @ApiPropertyOptional({ description: 'Grade level', example: 'Grade 4' })
  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @ApiPropertyOptional({ description: 'Academic term', example: 'Term 1' })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiPropertyOptional({ description: 'Week number', example: 'Week 3' })
  @IsOptional()
  @IsString()
  week?: string;

  @ApiPropertyOptional({ description: 'Mission number', example: 'M01' })
  @IsOptional()
  @IsString()
  missionNumber?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 45 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Lesson theme' })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({ description: 'Real-world problem statement' })
  @IsOptional()
  @IsString()
  realWorldProblem?: string;

  @ApiPropertyOptional({ description: 'Big idea for the lesson' })
  @IsOptional()
  @IsString()
  bigIdea?: string;

  @ApiPropertyOptional({ description: 'Essential question' })
  @IsOptional()
  @IsString()
  essentialQuestion?: string;

  @ApiPropertyOptional({ description: 'Learning outcomes', type: [String] })
  @IsOptional()
  @IsArray()
  learningOutcomes?: string[];

  @ApiPropertyOptional({ description: 'Success criteria', type: [String] })
  @IsOptional()
  @IsArray()
  successCriteria?: string[];

  @ApiPropertyOptional({ description: 'Key vocabulary items' })
  @IsOptional()
  @IsArray()
  keyVocabulary?: any[];

  @ApiPropertyOptional({ description: 'NERDC theme' })
  @IsOptional()
  @IsString()
  nerdcTheme?: string;

  @ApiPropertyOptional({ description: 'NERDC topic' })
  @IsOptional()
  @IsString()
  nerdcTopic?: string;

  @ApiPropertyOptional({ description: 'NERDC objectives', type: [String] })
  @IsOptional()
  @IsArray()
  nerdcObjectives?: string[];

  @ApiPropertyOptional({ description: 'Input component description' })
  @IsOptional()
  @IsString()
  inputComponent?: string;

  @ApiPropertyOptional({ description: 'Brain component description' })
  @IsOptional()
  @IsString()
  brainComponent?: string;

  @ApiPropertyOptional({ description: 'Output component description' })
  @IsOptional()
  @IsString()
  outputComponent?: string;

  @ApiPropertyOptional({ description: 'Kit components list' })
  @IsOptional()
  @IsArray()
  kitComponents?: any[];

  @ApiPropertyOptional({ description: 'Teacher materials list' })
  @IsOptional()
  @IsArray()
  teacherMaterials?: any[];

  @ApiPropertyOptional({ description: 'Learner materials list' })
  @IsOptional()
  @IsArray()
  learnerMaterials?: any[];

  @ApiPropertyOptional({ description: 'Introductory text' })
  @IsOptional()
  @IsString()
  introText?: string;

  @ApiPropertyOptional({ description: 'Teaching points' })
  @IsOptional()
  @IsArray()
  teachingPoints?: any[];

  @ApiPropertyOptional({ description: 'Class activities' })
  @IsOptional()
  @IsArray()
  classActivities?: any[];

  @ApiPropertyOptional({ description: 'Infographic manual content' })
  @IsOptional()
  @IsString()
  infographicManual?: string;

  @ApiPropertyOptional({ description: 'Engineering design problem' })
  @IsOptional()
  @IsString()
  engineeringProblem?: string;

  @ApiPropertyOptional({ description: 'Engineering input' })
  @IsOptional()
  @IsString()
  engineeringInput?: string;

  @ApiPropertyOptional({ description: 'Engineering brain' })
  @IsOptional()
  @IsString()
  engineeringBrain?: string;

  @ApiPropertyOptional({ description: 'Engineering output' })
  @IsOptional()
  @IsString()
  engineeringOutput?: string;

  @ApiPropertyOptional({ description: 'Engineering solution' })
  @IsOptional()
  @IsString()
  engineeringSolution?: string;

  @ApiPropertyOptional({ description: 'Home challenge object' })
  @IsOptional()
  @IsObject()
  homeChallenge?: any;

  @ApiPropertyOptional({ description: 'Assessment type', example: 'formative' })
  @IsOptional()
  @IsString()
  assessmentType?: string;

  @ApiPropertyOptional({ description: 'Assessment scale' })
  @IsOptional()
  @IsString()
  assessmentScale?: string;

  @ApiPropertyOptional({ description: 'Assessment dimension' })
  @IsOptional()
  @IsString()
  assessmentDimension?: string;

  @ApiPropertyOptional({ description: 'Assessment evidence type' })
  @IsOptional()
  @IsString()
  assessmentEvidenceType?: string;

  @ApiPropertyOptional({ description: 'Assessment questions' })
  @IsOptional()
  @IsArray()
  assessmentQuestions?: any[];

  @ApiPropertyOptional({ description: 'Observation checklist items' })
  @IsOptional()
  @IsArray()
  observationChecklist?: any[];

  @ApiPropertyOptional({ description: 'Portfolio description' })
  @IsOptional()
  @IsString()
  portfolioDescription?: string;

  @ApiPropertyOptional({ description: 'Portfolio label' })
  @IsOptional()
  @IsString()
  portfolioLabel?: string;

  @ApiPropertyOptional({ description: 'Coaching notes for the teacher' })
  @IsOptional()
  @IsString()
  coachingNotes?: string;

  @ApiPropertyOptional({ description: 'Tools used in the lesson' })
  @IsOptional()
  @IsString()
  tools?: string;
}
