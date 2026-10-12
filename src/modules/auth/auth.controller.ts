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
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from './current-user.decorator';

const REFRESH_COOKIE = 'tc_refresh';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieOptions() {
    const isProd = this.config.get<string>('nodeEnv') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
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
    const tokens = await this.auth.loginSession(admin, req.headers['user-agent'], req.ip);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, this.cookieOptions());
    return { accessToken: tokens.accessToken, email: admin.email };
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
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return { email: user.email };
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
