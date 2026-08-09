import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { HomeworkFilterDto } from './dto/homework-filter.dto';
import { SubmissionFilterDto } from './dto/submission-filter.dto';

@ApiTags('homework')
@ApiBearerAuth('bearer')
@Controller('homework')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  // ─── Homework CRUD ──────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List homework with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of homework' })
  async findAll(@Query() filters: HomeworkFilterDto, @CurrentUser() user: any) {
    return this.homeworkService.findAll(filters, user);
  }

  @Post()
  @Roles('teacher')
  @ApiOperation({ summary: 'Create a new homework assignment' })
  @ApiResponse({ status: 201, description: 'Homework created' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async create(@Body() dto: CreateHomeworkDto) {
    return this.homeworkService.create(dto);
  }

  @Get('compliance')
  @Roles('principal', 'platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Per-class homework compliance breakdown' })
  @ApiResponse({ status: 200, description: 'Array of per-class compliance stats' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async getCompliance(
    @Query('schoolId') schoolId?: string,
    @Query('term') term?: string,
  ) {
    return this.homeworkService.getCompliance(schoolId, term);
  }

  @Post('reminders')
  @Roles('teacher', 'principal')
  @ApiOperation({ summary: 'Send bulk reminders to parents of pending/late learners' })
  @ApiResponse({ status: 201, description: 'Reminders queued' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  async sendReminders(@Body('homeworkId') homeworkId: string) {
    return this.homeworkService.sendReminders(homeworkId);
  }

  @Get('submissions/:submissionId')
  @ApiOperation({ summary: 'Get a single submission detail with files and messages' })
  @ApiParam({ name: 'submissionId', description: 'Submission UUID' })
  @ApiResponse({ status: 200, description: 'Submission detail' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async findSubmission(@Param('submissionId') submissionId: string) {
    return this.homeworkService.findSubmissionById(submissionId);
  }

  @Patch('submissions/:submissionId')
  @ApiOperation({ summary: 'Update a submission (add file, etc.)' })
  @ApiParam({ name: 'submissionId', description: 'Submission UUID' })
  @ApiResponse({ status: 200, description: 'Submission updated' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async updateSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.homeworkService.updateSubmission(submissionId, dto);
  }

  @Patch('submissions/:submissionId/feedback')
  @Roles('teacher')
  @ApiOperation({ summary: 'Publish teacher feedback on a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission UUID' })
  @ApiResponse({ status: 200, description: 'Feedback published' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async publishFeedback(@Param('submissionId') submissionId: string) {
    return this.homeworkService.publishFeedback(submissionId);
  }

  @Get('submissions/:submissionId/messages')
  @ApiOperation({ summary: 'Get message thread for a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission UUID' })
  @ApiResponse({ status: 200, description: 'Array of messages sorted by createdAt ASC' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async findMessages(@Param('submissionId') submissionId: string) {
    return this.homeworkService.findMessages(submissionId);
  }

  @Post('submissions/:submissionId/messages')
  @Roles('teacher', 'parent')
  @ApiOperation({ summary: 'Send a message on a submission thread' })
  @ApiParam({ name: 'submissionId', description: 'Submission UUID' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async createMessage(
    @Param('submissionId') submissionId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.homeworkService.createMessage(submissionId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get homework detail with submission stats' })
  @ApiParam({ name: 'id', description: 'Homework UUID' })
  @ApiResponse({ status: 200, description: 'Homework detail with stats' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  async findOne(@Param('id') id: string) {
    return this.homeworkService.findById(id);
  }

  @Patch(':id')
  @Roles('teacher')
  @ApiOperation({ summary: 'Update a homework assignment' })
  @ApiParam({ name: 'id', description: 'Homework UUID' })
  @ApiResponse({ status: 200, description: 'Homework updated' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateHomeworkDto) {
    return this.homeworkService.update(id, dto);
  }

  @Delete(':id')
  @Roles('teacher')
  @ApiOperation({ summary: 'Delete a draft homework assignment' })
  @ApiParam({ name: 'id', description: 'Homework UUID' })
  @ApiResponse({ status: 200, description: 'Homework deleted' })
  @ApiResponse({ status: 400, description: 'Only draft homework can be deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  async remove(@Param('id') id: string) {
    return this.homeworkService.remove(id);
  }

  // ─── Submissions (nested under homework) ────────────────────────

  @Get(':id/submissions')
  @ApiOperation({ summary: 'List submissions for a homework' })
  @ApiParam({ name: 'id', description: 'Homework UUID' })
  @ApiResponse({ status: 200, description: 'Paginated list of submissions' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  async findSubmissions(
    @Param('id') id: string,
    @Query() filters: SubmissionFilterDto,
  ) {
    return this.homeworkService.findSubmissions(id, filters);
  }

  @Post(':id/submissions')
  @Roles('parent')
  @ApiOperation({ summary: 'Create a submission (parent uploads for child)' })
  @ApiParam({ name: 'id', description: 'Homework UUID' })
  @ApiResponse({ status: 201, description: 'Submission created' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  async createSubmission(
    @Param('id') id: string,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.homeworkService.createSubmission(id, dto);
  }
}
