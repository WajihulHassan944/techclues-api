import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TwoFactorDisableDto, TwoFactorEnableDto, TwoFactorLoginDto } from './dto/two-factor.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from './current-user.decorator';
import { Admin } from '../../database/schemas/admin.schema';
import { ActivityService } from '../activity/activity.service';

const REFRESH_COOKIE = 'tc_refresh';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly activity: ActivityService,
  ) {}

  private cookieAttrs() {
    const isProd = this.config.get<string>('nodeEnv') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
      path: '/api/auth',
    };
  }

  private cookieOptions() {
    return { ...this.cookieAttrs(), maxAge: 7 * 24 * 60 * 60 * 1000 };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const admin = await this.auth.validateLogin(dto.email, dto.password, req.ip);
    if (admin.twoFactorEnabled) {
      return { twoFactorRequired: true, tempToken: this.auth.issueTwoFactorPendingToken(admin) };
    }
    const tokens = await this.auth.loginSession(admin, req.headers['user-agent'], req.ip);
    await this.auth.completeLogin(admin, req.ip);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, this.cookieOptions());
    return { accessToken: tokens.accessToken, email: admin.email, role: admin.role };
  }

  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('login/2fa')
  @HttpCode(200)
  async loginTwoFactor(
    @Body() dto: TwoFactorLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const admin = await this.auth.verifyTwoFactorPendingToken(dto.tempToken);
    const isTotp = this.auth.verifyTotp(admin, dto.code);
    const isRecovery = !isTotp && (await this.auth.consumeRecoveryCode(admin, dto.code));
    if (!isTotp && !isRecovery) throw new UnauthorizedException('Invalid or expired code');
    const tokens = await this.auth.loginSession(admin, req.headers['user-agent'], req.ip);
    await this.auth.completeLogin(admin, req.ip);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, this.cookieOptions());
    return { accessToken: tokens.accessToken, email: admin.email, role: admin.role };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new UnauthorizedException('No refresh token');
    const tokens = await this.auth.refresh(token);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, this.cookieOptions());
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.revokeSessionFromToken(req.cookies?.[REFRESH_COOKIE]);
    // Match the attributes the cookie was set with (secure, sameSite, path) — some browsers
    // won't apply a clearing Set-Cookie that doesn't match, leaving the old cookie in place.
    res.clearCookie(REFRESH_COOKIE, this.cookieAttrs());
    return { ok: true };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.requestPasswordReset(dto.email);
    return { ok: true };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto.email, dto.token, dto.newPassword);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const admin = await this.adminModel.findById(user.sub).lean();
    return {
      email: user.email,
      role: user.role,
      name: admin?.name,
      twoFactorEnabled: admin?.twoFactorEnabled ?? false,
    };
  }

  /** Starts 2FA enrollment: generates a secret and a scannable QR, but doesn't enable 2FA yet. */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  @HttpCode(200)
  async setupTwoFactor(@CurrentUser() user: AuthUser) {
    const admin = await this.adminModel.findById(user.sub);
    if (!admin) throw new UnauthorizedException();
    const secret = authenticator.generateSecret();
    admin.twoFactorSecret = secret;
    await admin.save();
    const otpauth = authenticator.keyuri(admin.email, 'TechClues Admin', secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth);
    return { secret, qrDataUrl };
  }

  /** Confirms the code from an authenticator app and turns 2FA on, returning one-time recovery codes. */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @HttpCode(200)
  async enableTwoFactor(@CurrentUser() user: AuthUser, @Body() dto: TwoFactorEnableDto) {
    const admin = await this.adminModel.findById(user.sub);
    if (!admin) throw new UnauthorizedException();
    if (!this.auth.verifyTotp(admin, dto.code)) throw new UnauthorizedException('Incorrect code');
    const recoveryCodes = Array.from({ length: 8 }, () => randomBytes(5).toString('hex'));
    admin.twoFactorEnabled = true;
    admin.twoFactorRecoveryCodes = recoveryCodes;
    await admin.save();
    await this.activity.log('security', `Enabled two-factor authentication for ${admin.email}`);
    return { ok: true, recoveryCodes };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(200)
  async disableTwoFactor(@CurrentUser() user: AuthUser, @Body() dto: TwoFactorDisableDto) {
    const admin = await this.adminModel.findById(user.sub);
    if (!admin) throw new UnauthorizedException();
    const matches = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!matches) throw new UnauthorizedException('Incorrect password');
    admin.twoFactorEnabled = false;
    admin.twoFactorSecret = undefined;
    admin.twoFactorRecoveryCodes = [];
    await admin.save();
    await this.activity.log('security', `Disabled two-factor authentication for ${admin.email}`);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.auth.changePassword(
      user.sub,
      user.sid,
      dto.currentPassword,
      dto.newPassword,
    );
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, this.cookieOptions());
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async sessions(@CurrentUser() user: AuthUser) {
    const sessions = await this.auth.listSessions(user.sub);
    return sessions.map((s) => ({
      id: String(s._id),
      device: s.device,
      ip: s.ip,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      current: String(s._id) === user.sid,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async revokeSession(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.auth.revokeSession(user.sub, id);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-others')
  @HttpCode(200)
  async revokeOthers(@CurrentUser() user: AuthUser) {
    await this.auth.revokeOtherSessions(user.sub, user.sid);
    return { ok: true };
  }
}
