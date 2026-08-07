import {
  Body,
  Controller,
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
import { UserStatus } from '../../database/entities/user.entity';
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
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
  async findAll(@Query() filters: UserFilterDto) {
    return this.usersService.findAll(filters);
  }

  @Post('invite')
  @Roles('platform_admin', 'curriculum_admin', 'principal')
  @ApiOperation({ summary: 'Create a new user with an invite code' })
  @ApiResponse({ status: 201, description: 'User created with invite code' })
  @ApiResponse({ status: 400, description: 'Duplicate email or phone' })
  @ApiResponse({ status: 403, description: 'Forbidden — insufficient role' })
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
    description: 'Password reset — temporary password returned',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }
}
