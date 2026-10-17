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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const settings_schema_1 = require("../../database/schemas/settings.schema");
const defaults_1 = require("../../common/constants/defaults");
const activity_service_1 = require("../activity/activity.service");
let SettingsService = class SettingsService {
    constructor(model, activity) {
        this.model = model;
        this.activity = activity;
    }
    async get() {
        let settings = await this.model.findOne();
        if (!settings) {
            settings = await this.model.create({
                recipients: ['info@techclues.co.uk'],
                events: { enquiry: true, booking: true, cancelled: true, subscriber: false, summary: true },
                summaryTime: '08:00',
                fromName: 'TechClues',
                signature: defaults_1.SIGNATURE,
                templates: defaults_1.DEFAULT_TEMPLATES,
                retention: { spamDays: 30, enquiryMonths: 0 },
            });
        }
        return settings;
    }
    async update(patch, activityText) {
        const settings = await this.get();
        Object.assign(settings, patch);
        await settings.save();
        if (activityText)
            await this.activity.log('settings', activityText);
        return settings;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(settings_schema_1.Settings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        activity_service_1.ActivityService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map