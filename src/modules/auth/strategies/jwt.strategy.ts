import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../../../database/schemas/admin.schema';
import { Session } from '../../../database/schemas/session.schema';
import { JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret')!,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') throw new UnauthorizedException('Invalid token type');
    const admin = await this.adminModel.findById(payload.sub);
    if (!admin || admin.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Session no longer valid');
    }
    if (payload.sid) {
      const session = await this.sessionModel.findById(payload.sid);
      if (!session || session.revoked) throw new UnauthorizedException('Session no longer valid');
    }
    return { sub: payload.sub, email: payload.email, sid: payload.sid };
  }
}
