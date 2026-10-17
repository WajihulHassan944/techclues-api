"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const mongoose_2 = require("mongoose");
const admin_schema_1 = require("../../database/schemas/admin.schema");
const session_schema_1 = require("../../database/schemas/session.schema");
const activity_service_1 = require("../activity/activity.service");
const user_agent_1 = require("../../common/utils/user-agent");
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
let AuthService = AuthService_1 = class AuthService {
    constructor(adminModel, sessionModel, jwt, config, activity) {
        this.adminModel = adminModel;
        this.sessionModel = sessionModel;
        this.jwt = jwt;
        this.config = config;
        this.activity = activity;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async onModuleInitSeed() {
        const email = this.config.get('admin.email');
        const passwordHash = this.config.get('admin.passwordHash');
        const existing = await this.adminModel.findOne({ email: email.toLowerCase() });
        if (!existing) {
            await this.adminModel.create({ email: email.toLowerCase(), passwordHash });
            this.logger.log(`Seeded admin account for ${email}`);
        }
    }
    async validateLogin(email, password, ip) {
        const admin = await this.adminModel.findOne({ email: email.toLowerCase() });
        if (!admin)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
            const minutesLeft = Math.ceil((admin.lockUntil.getTime() - Date.now()) / 60000);
            throw new common_1.ForbiddenException(`Account locked due to repeated failed logins. Try again in ${minutesLeft} minute(s).`);
        }
        const matches = await bcrypt.compare(password, admin.passwordHash);
        if (!matches) {
            admin.failedLoginAttempts += 1;
            if (admin.failedLoginAttempts >= MAX_ATTEMPTS) {
                admin.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
                admin.failedLoginAttempts = 0;
                await this.activity.log('security', `Account locked for ${LOCK_MINUTES} minutes after repeated failed logins${ip ? ` from ${ip}` : ''}`);
            }
            await admin.save();
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        admin.failedLoginAttempts = 0;
        admin.lockUntil = undefined;
        await admin.save();
        await this.activity.log('security', `Signed in${ip ? ` from ${ip}` : ''}`);
        return admin;
    }
    issueTokens(admin, sid) {
        const basePayload = {
            sub: String(admin._id),
            email: admin.email,
            tokenVersion: admin.tokenVersion,
            sid,
        };
        const accessToken = this.jwt.sign({ ...basePayload, type: 'access' }, {
            secret: this.config.get('jwt.secret'),
            expiresIn: this.config.get('jwt.accessTtl'),
        });
        const refreshToken = this.jwt.sign({ ...basePayload, type: 'refresh' }, {
            secret: this.config.get('jwt.refreshSecret'),
            expiresIn: this.config.get('jwt.refreshTtl'),
        });
        return { accessToken, refreshToken };
    }
    async loginSession(admin, userAgent, ip) {
        const session = await this.sessionModel.create({
            adminId: String(admin._id),
            device: (0, user_agent_1.describeDevice)(userAgent),
            ip,
            createdAt: new Date(),
            lastUsedAt: new Date(),
            revoked: false,
        });
        return this.issueTokens(admin, String(session._id));
    }
    async refresh(token) {
        let payload;
        try {
            payload = this.jwt.verify(token, { secret: this.config.get('jwt.refreshSecret') });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (payload.type !== 'refresh')
            throw new common_1.UnauthorizedException('Invalid token type');
        const admin = await this.adminModel.findById(payload.sub);
        if (!admin || admin.tokenVersion !== payload.tokenVersion) {
            throw new common_1.UnauthorizedException('Session no longer valid');
        }
        if (payload.sid) {
            const session = await this.sessionModel.findById(payload.sid);
            if (!session || session.revoked)
                throw new common_1.UnauthorizedException('Session no longer valid');
            session.lastUsedAt = new Date();
            await session.save();
        }
        return this.issueTokens(admin, payload.sid);
    }
    async changePassword(adminId, currentSid, currentPassword, newPassword) {
        const admin = await this.adminModel.findById(adminId);
        if (!admin)
            throw new common_1.UnauthorizedException();
        const matches = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!matches)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        admin.passwordHash = await bcrypt.hash(newPassword, 12);
        admin.tokenVersion += 1;
        admin.passwordChangedAt = new Date();
        await admin.save();
        await this.sessionModel.updateMany({ adminId, _id: { $ne: currentSid } }, { revoked: true });
        await this.activity.log('security', 'Password changed — all other sessions signed out');
        return this.issueTokens(admin, currentSid);
    }
    async findById(id) {
        return this.adminModel.findById(id);
    }
    async listSessions(adminId) {
        return this.sessionModel.find({ adminId, revoked: false }).sort({ lastUsedAt: -1 }).lean();
    }
    async revokeSession(adminId, sessionId) {
        if (!mongoose_2.Types.ObjectId.isValid(sessionId))
            return;
        await this.sessionModel.updateOne({ _id: sessionId, adminId }, { revoked: true });
    }
    async revokeOtherSessions(adminId, currentSid) {
        await this.sessionModel.updateMany({ adminId, _id: { $ne: currentSid } }, { revoked: true });
    }
    async revokeSessionFromToken(token) {
        if (!token)
            return;
        const decoded = this.jwt.decode(token);
        if (decoded?.sid)
            await this.sessionModel.updateOne({ _id: decoded.sid }, { revoked: true });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(admin_schema_1.Admin.name)),
    __param(1, (0, mongoose_1.InjectModel)(session_schema_1.Session.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        activity_service_1.ActivityService])
], AuthService);
//# sourceMappingURL=auth.service.js.map