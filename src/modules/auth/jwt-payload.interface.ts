import { AdminRole } from '../../database/schemas/admin.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: AdminRole;
  tokenVersion: number;
  type: 'access' | 'refresh';
  sid: string;
}

/** Short-lived token issued after a correct password but before a required 2FA code. */
export interface TwoFactorPendingPayload {
  sub: string;
  type: 'twofactor-pending';
}
