import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { ActivateDto } from './dto/activate.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  @ApiOperation({
    summary: 'Sign in with email/phone, password, and role',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT access token and user profile',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials or role mismatch' })
  async signin(@Body() dto: SignInDto) {
    const user = await this.authService.validateUser(dto.identifier, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.signin(user, dto.role, dto.rememberMe);
  }

  @Public()
  @Post('activate')
  @ApiOperation({
    summary: 'Activate account with invite code and set password',
  })
  @ApiResponse({
    status: 200,
    description: 'Account activated — JWT token and profile returned',
  })
  @ApiResponse({ status: 400, description: 'Invalid invite code or already activated' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async activate(@Body() dto: ActivateDto) {
    return this.authService.activate(dto);
  }

  @Public()
  @Post('otp/send')
  @ApiOperation({
    summary: 'Send a 6-digit OTP for school owner step-up auth',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.generateOtp(dto.userId);
  }

  @Public()
  @Post('otp/verify')
  @ApiOperation({
    summary: 'Verify 6-digit OTP and sign in',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified — JWT token and profile returned',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.userId, dto.code);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Send password reset instructions by email or phone',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset instructions sent (if account exists)',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.identifier);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password using a valid reset token',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid/expired token or password mismatch' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.token,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update current user profile (theme, name, etc.)' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }
}
