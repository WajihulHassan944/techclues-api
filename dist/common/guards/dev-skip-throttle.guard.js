"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevSkipThrottleGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let DevSkipThrottleGuard = class DevSkipThrottleGuard extends throttler_1.ThrottlerGuard {
    async shouldSkip(_context) {
        const effectiveEnv = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
        return effectiveEnv !== 'production';
    }
};
exports.DevSkipThrottleGuard = DevSkipThrottleGuard;
exports.DevSkipThrottleGuard = DevSkipThrottleGuard = __decorate([
    (0, common_1.Injectable)()
], DevSkipThrottleGuard);
//# sourceMappingURL=dev-skip-throttle.guard.js.map