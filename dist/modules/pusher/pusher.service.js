"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PusherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PusherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pusher_1 = __importDefault(require("pusher"));
let PusherService = PusherService_1 = class PusherService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(PusherService_1.name);
        const appId = config.get('pusher.appId');
        const key = config.get('pusher.key');
        const secret = config.get('pusher.secret');
        const cluster = config.get('pusher.cluster');
        if (appId && key && secret && cluster) {
            this.client = new pusher_1.default({ appId, key, secret, cluster, useTLS: true });
        }
        else {
            this.logger.warn('Pusher not configured — realtime events are disabled');
        }
    }
    async trigger(event, payload) {
        if (!this.client)
            return;
        try {
            await this.client.trigger('private-admin', event, payload);
        }
        catch (err) {
            this.logger.error(`Failed to trigger Pusher event ${event}`, err);
        }
    }
    authenticate(socketId, channel, userId) {
        if (!this.client)
            throw new Error('Pusher not configured');
        if (channel !== 'private-admin')
            throw new Error('Unknown channel');
        return this.client.authorizeChannel(socketId, channel, {
            user_id: userId,
        });
    }
};
exports.PusherService = PusherService;
exports.PusherService = PusherService = PusherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PusherService);
//# sourceMappingURL=pusher.service.js.map