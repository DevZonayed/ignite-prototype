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
import { UserRole, UserStatus } from '../../database/entities/user.entity';
import { LinkChildrenDto } from './dto/link-children.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';

@ApiTags('users')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'List users with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async findAll(@Query() filters: UserFilterDto) {
    return this.usersService.findAll(filters);
  }

  @Post('invite')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Create a new user with an invite code' })
  @ApiResponse({ status: 201, description: 'User created with invite code' })
  @ApiResponse({ status: 400, description: 'Duplicate email or phone' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async invite(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':id')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles('platform_admin', 'curriculum_admin')
  @ApiOperation({ summary: 'Update a user (role, school assignment, etc.)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Duplicate email or phone' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Suspend or activate a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User status updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    return this.usersService.updateStatus(id, status);
  }

  @Post(':id/reset-password')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Admin-initiated password reset' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'Password reset. Temporary password returned',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }

  @Delete(':id')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Refused while the account still owns lesson sessions or evidence, since ' +
      'both cascade on delete — suspend the account instead to keep that ' +
      'history. Classes led by the user survive as unassigned. A principal may ' +
      'only delete non-admin accounts at their own school, and nobody may ' +
      'delete themselves.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete your own account' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User still owns teaching records' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() actor: { id: string; role: UserRole; schoolId: string | null },
  ) {
    return this.usersService.remove(id, actor);
  }

  // ── Parent ↔ child links ────────────────────────────────────────────
  //
  // Nothing in the system could create one of these, so every real parent
  // account opened to an empty app.

  @Get(':id/children')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Learners linked to a parent' })
  @ApiParam({ name: 'id', description: 'Parent UUID' })
  @ApiResponse({ status: 200, description: 'Linked learners' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  async listChildren(@Param('id') id: string) {
    return this.usersService.findLinkedChildren(id);
  }

  @Post(':id/children')
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Link learners to a parent' })
  @ApiParam({ name: 'id', description: 'Parent UUID' })
  @ApiResponse({ status: 201, description: 'Updated link list' })
  @ApiResponse({ status: 400, description: 'Not a parent/learner, or wrong school' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  @ApiResponse({ status: 404, description: 'Parent or learner not found' })
  async linkChildren(@Param('id') id: string, @Body() dto: LinkChildrenDto) {
    return this.usersService.linkChildren(id, dto.childIds);
  }

  @Delete(':id/children/:childId')
  @Roles('platform_admin', 'principal')
  @ApiOperation({ summary: 'Remove a parent-child link' })
  @ApiParam({ name: 'id', description: 'Parent UUID' })
  @ApiParam({ name: 'childId', description: 'Learner UUID' })
  @ApiResponse({ status: 200, description: 'Link removed' })
  @ApiResponse({ status: 403, description: 'Forbidden, insufficient role' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async unlinkChild(@Param('id') id: string, @Param('childId') childId: string) {
    return this.usersService.unlinkChild(id, childId);
  }
}
