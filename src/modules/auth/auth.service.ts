import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { Admin } from '../../database/schemas/admin.schema';
import { ActivityService } from '../activity/activity.service';
import { JwtPayload } from './jwt-payload.interface';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly activity: ActivityService,
  ) {}

  /** Ensures exactly one admin document exists, seeded from env on first boot. */
  async onModuleInitSeed() {
    const email = this.config.get<string>('admin.email')!;
    const passwordHash = this.config.get<string>('admin.passwordHash')!;
    const existing = await this.adminModel.findOne({ email: email.toLowerCase() });
    if (!existing) {
      await this.adminModel.create({ email: email.toLowerCase(), passwordHash });
      this.logger.log(`Seeded admin account for ${email}`);
    }
  }

  async validateLogin(email: string, password: string, ip?: string) {
    const admin = await this.adminModel.findOne({ email: email.toLowerCase() });
    if (!admin) throw new UnauthorizedException('Invalid email or password');

    if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
      const minutesLeft = Math.ceil((admin.lockUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(
        `Account locked due to repeated failed logins. Try again in ${minutesLeft} minute(s).`,
      );
    }

    const matches = await bcrypt.compare(password, admin.passwordHash);
    if (!matches) {
      admin.failedLoginAttempts += 1;
      if (admin.failedLoginAttempts >= MAX_ATTEMPTS) {
        admin.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
        admin.failedLoginAttempts = 0;
        await this.activity.log(
          'security',
          `Account locked for ${LOCK_MINUTES} minutes after repeated failed logins${ip ? ` from ${ip}` : ''}`,
        );
      }
      await admin.save();
      throw new UnauthorizedException('Invalid email or password');
    }

    admin.failedLoginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();
    await this.activity.log('security', `Signed in${ip ? ` from ${ip}` : ''}`);
    return admin;
  }

  issueTokens(admin: Admin) {
    const basePayload = {
      sub: String(admin._id),
      email: admin.email,
      tokenVersion: admin.tokenVersion,
    };
    const accessToken = this.jwt.sign({ ...basePayload, type: 'access' } as JwtPayload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.accessTtl'),
    });
    const refreshToken = this.jwt.sign({ ...basePayload, type: 'refresh' } as JwtPayload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshTtl'),
    });
    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify(token, { secret: this.config.get<string>('jwt.refreshSecret') });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type');
    const admin = await this.adminModel.findById(payload.sub);
    if (!admin || admin.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Session no longer valid');
    }
    return this.issueTokens(admin);
  }

  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await this.adminModel.findById(adminId);
    if (!admin) throw new UnauthorizedException();
    const matches = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!matches) throw new UnauthorizedException('Current password is incorrect');
    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    admin.tokenVersion += 1;
    admin.passwordChangedAt = new Date();
    await admin.save();
    await this.activity.log('security', 'Password changed — all other sessions signed out');
    return this.issueTokens(admin);
  }

  async findById(id: string) {
    return this.adminModel.findById(id);
  }
}
