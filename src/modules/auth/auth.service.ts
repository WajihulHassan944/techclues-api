import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { Model, Types } from 'mongoose';
import { Admin } from '../../database/schemas/admin.schema';
import { Session } from '../../database/schemas/session.schema';
import { ActivityService } from '../activity/activity.service';
import { describeDevice } from '../../common/utils/user-agent';
import { JwtPayload, TwoFactorPendingPayload } from './jwt-payload.interface';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
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
      await this.adminModel.create({ email: email.toLowerCase(), passwordHash, role: 'super_admin' });
      this.logger.log(`Seeded super admin account for ${email}`);
    }
  }

  /** Checks email + password only; does not create a session. Throws if blocked/locked/invalid. */
  async validateLogin(email: string, password: string, ip?: string) {
    const admin = await this.adminModel.findOne({ email: email.toLowerCase() });
    if (!admin) throw new UnauthorizedException('Invalid email or password');

    if (admin.blocked) throw new ForbiddenException('This account has been blocked.');

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
    return admin;
  }

  /** Issues a short-lived token identifying an admin who passed password check but still owes a 2FA code. */
  issueTwoFactorPendingToken(admin: Admin) {
    return this.jwt.sign(
      { sub: String(admin._id), type: 'twofactor-pending' } as TwoFactorPendingPayload,
      { secret: this.config.get<string>('jwt.secret'), expiresIn: '5m' },
    );
  }

  async verifyTwoFactorPendingToken(token: string) {
    let payload: TwoFactorPendingPayload;
    try {
      payload = this.jwt.verify(token, { secret: this.config.get<string>('jwt.secret') });
    } catch {
      throw new UnauthorizedException('That code has expired — please sign in again');
    }
    if (payload.type !== 'twofactor-pending') throw new UnauthorizedException('Invalid token');
    const admin = await this.adminModel.findById(payload.sub);
    if (!admin || admin.blocked) throw new UnauthorizedException('Invalid or expired token');
    return admin;
  }

  verifyTotp(admin: Admin, code: string) {
    if (!admin.twoFactorSecret) return false;
    return authenticator.check(code.replace(/\s+/g, ''), admin.twoFactorSecret);
  }

  async consumeRecoveryCode(admin: Admin, code: string) {
    const normalized = code.trim().toLowerCase();
    const idx = admin.twoFactorRecoveryCodes.findIndex((c) => c === normalized);
    if (idx === -1) return false;
    admin.twoFactorRecoveryCodes.splice(idx, 1);
    await admin.save();
    return true;
  }

  async completeLogin(admin: Admin, ip: string | undefined) {
    await this.activity.log('security', `Signed in${ip ? ` from ${ip}` : ''}`);
    admin.lastLoginAt = new Date();
    await admin.save();
  }

  issueTokens(admin: Admin, sid: string) {
    const basePayload = {
      sub: String(admin._id),
      email: admin.email,
      role: admin.role,
      tokenVersion: admin.tokenVersion,
      sid,
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

  /** Creates the session record for a fresh login and returns tokens carrying its id. */
  async loginSession(admin: Admin, userAgent: string | undefined, ip: string | undefined) {
    const session = await this.sessionModel.create({
      adminId: String(admin._id),
      device: describeDevice(userAgent),
      ip,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      revoked: false,
    });
    return this.issueTokens(admin, String(session._id));
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
    if (payload.sid) {
      const session = await this.sessionModel.findById(payload.sid);
      if (!session || session.revoked) throw new UnauthorizedException('Session no longer valid');
      session.lastUsedAt = new Date();
      await session.save();
    }
    return this.issueTokens(admin, payload.sid);
  }

  async changePassword(
    adminId: string,
    currentSid: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const admin = await this.adminModel.findById(adminId);
    if (!admin) throw new UnauthorizedException();
    const matches = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!matches) throw new UnauthorizedException('Current password is incorrect');
    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    admin.tokenVersion += 1;
    admin.passwordChangedAt = new Date();
    await admin.save();
    // tokenVersion++ already invalidates every outstanding token; this just reflects it in the session list.
    await this.sessionModel.updateMany({ adminId, _id: { $ne: currentSid } }, { revoked: true });
    await this.activity.log('security', 'Password changed — all other sessions signed out');
    return this.issueTokens(admin, currentSid);
  }

  async findById(id: string) {
    return this.adminModel.findById(id);
  }

  async listSessions(adminId: string) {
    return this.sessionModel.find({ adminId, revoked: false }).sort({ lastUsedAt: -1 }).lean();
  }

  async revokeSession(adminId: string, sessionId: string) {
    if (!Types.ObjectId.isValid(sessionId)) return;
    await this.sessionModel.updateOne({ _id: sessionId, adminId }, { revoked: true });
  }

  async revokeOtherSessions(adminId: string, currentSid: string) {
    await this.sessionModel.updateMany({ adminId, _id: { $ne: currentSid } }, { revoked: true });
  }

  /** Best-effort: revokes the session named in a refresh token's claims without needing it to still be valid. */
  async revokeSessionFromToken(token: string | undefined) {
    if (!token) return;
    const decoded = this.jwt.decode(token) as JwtPayload | null;
    if (decoded?.sid) await this.sessionModel.updateOne({ _id: decoded.sid }, { revoked: true });
  }
}
