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
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const activity_schema_1 = require("../../database/schemas/activity.schema");
const MAX_ENTRIES = 300;
let ActivityService = class ActivityService {
    constructor(model) {
        this.model = model;
    }
    async log(kind, text) {
        await this.model.create({ kind, text, at: new Date() });
        const count = await this.model.countDocuments();
        if (count > MAX_ENTRIES) {
            const toRemove = await this.model
                .find()
                .sort({ at: 1 })
                .limit(count - MAX_ENTRIES)
                .select('_id');
            await this.model.deleteMany({ _id: { $in: toRemove.map((d) => d._id) } });
        }
    }
    async list(limit = 300) {
        return this.model.find().sort({ at: -1 }).limit(limit).lean();
    }
    async clear() {
        await this.model.deleteMany({});
    }
    async exportAll() {
        return this.model.find().sort({ at: -1 }).lean();
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(activity_schema_1.Activity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ActivityService);
//# sourceMappingURL=activity.service.js.map