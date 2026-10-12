export interface JwtPayload {
  sub: string;
  email: string;
  tokenVersion: number;
  type: 'access' | 'refresh';
  sid: string;
}
