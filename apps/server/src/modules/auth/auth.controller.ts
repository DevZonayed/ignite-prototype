import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
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
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { ActivateDto } from './dto/activate.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('invite/:code')
  @ApiOperation({
    summary: 'Look up a pending invite by its code',
    description:
      'Lets the activation screen fill in the address an invite was sent to, so ' +
      'the recipient only types the code and a password. Only ever resolves a ' +
      'code that is still pending — activating clears it, so a used code 404s.',
  })
  @ApiParam({ name: 'code', description: 'Invite code from the invite email' })
  @ApiResponse({ status: 200, description: 'Email, name and role for the invite' })
  @ApiResponse({ status: 404, description: 'No pending invite for this code' })
  async lookupInvite(@Param('code') code: string) {
    return this.authService.lookupInvite(code);
  }

  @Public()
  @Get('bootstrap-status')
  @ApiOperation({
    summary: 'Whether the platform still needs its first administrator',
    description:
      'Returns { needsBootstrap: true } only while no platform_admin exists. The portal calls this on load to decide between the sign-in form and first-run setup.',
  })
  @ApiResponse({ status: 200, description: '{ needsBootstrap: boolean }' })
  async bootstrapStatus() {
    return this.authService.needsBootstrap();
  }

  @Public()
  @Post('bootstrap')
  @ApiOperation({
    summary: 'Create the first platform administrator (first run only)',
    description:
      'Unauthenticated by necessity. Refuses with 409 as soon as any platform_admin exists, so it cannot be used to mint extra admins later.',
  })
  @ApiResponse({ status: 201, description: 'Admin created. JWT and profile returned' })
  @ApiResponse({ status: 400, description: 'Validation error or password mismatch' })
  @ApiResponse({ status: 409, description: 'A platform administrator already exists' })
  async bootstrap(@Body() dto: BootstrapAdminDto) {
    return this.authService.bootstrapFirstAdmin(dto);
  }

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
    description: 'Account activated. JWT token and profile returned',
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
    description: 'OTP verified. JWT token and profile returned',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.userId, dto.code);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Email a 6-digit password reset code (step 1 of 3)',
    description:
      'Always reports success so the endpoint cannot be used to discover which addresses have accounts. When SMTP is unconfigured the code is logged server-side and returned as `devCode`.',
  })
  @ApiResponse({
    status: 200,
    description: 'A code has been sent (if the account exists)',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.identifier);
  }

  @Public()
  @Post('password-reset/verify-otp')
  @ApiOperation({
    summary: 'Exchange a valid 6-digit code for a reset token (step 2 of 3)',
  })
  @ApiResponse({ status: 200, description: 'Single-use reset token' })
  @ApiResponse({ status: 400, description: 'Code is invalid, expired, or exhausted' })
  async verifyResetOtp(@Body() dto: VerifyResetOtpDto) {
    return this.authService.verifyPasswordResetOtp(dto.identifier, dto.code);
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

  @Post('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Change your own password',
    description: 'Requires the current password, so a hijacked session cannot lock the owner out.',
  })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 400, description: 'Validation error or passwords do not match' })
  @ApiResponse({ status: 401, description: 'Current password is not correct' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
