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
exports.FaqService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const faq_schema_1 = require("../../database/schemas/faq.schema");
const activity_service_1 = require("../activity/activity.service");
let FaqService = class FaqService {
    constructor(faqModel, activity) {
        this.faqModel = faqModel;
        this.activity = activity;
    }
    async listAll() {
        return this.faqModel.find().sort({ group: 1, order: 1 }).lean();
    }
    async listGroups() {
        const rows = await this.faqModel.aggregate([
            { $group: { _id: '$group', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        return rows.map((r) => ({ group: r._id, count: r.count }));
    }
    async listPublicGrouped() {
        const rows = await this.faqModel.find({ published: true }).sort({ group: 1, order: 1 }).lean();
        const out = {};
        for (const r of rows) {
            (out[r.group] ??= []).push({ q: r.question, a: r.answer });
        }
        return out;
    }
    async findOne(id) {
        const doc = await this.faqModel.findById(id);
        if (!doc)
            throw new common_1.NotFoundException('FAQ not found');
        return doc;
    }
    async create(input) {
        const last = await this.faqModel.findOne({ group: input.group }).sort({ order: -1 }).lean();
        const faq = await this.faqModel.create({ ...input, order: (last?.order ?? -1) + 1 });
        await this.activity.log('faq', `Added a question to "${input.group}"`);
        return faq;
    }
    async update(id, patch) {
        const faq = await this.findOne(id);
        Object.assign(faq, patch);
        await faq.save();
        await this.activity.log('faq', `Updated a question in "${faq.group}"`);
        return faq;
    }
    async remove(id) {
        const faq = await this.findOne(id);
        await faq.deleteOne();
        await this.activity.log('faq', `Deleted a question from "${faq.group}"`);
    }
    async reorder(group, ids) {
        await Promise.all(ids.map((id, order) => this.faqModel.updateOne({ _id: id, group }, { $set: { order } })));
    }
};
exports.FaqService = FaqService;
exports.FaqService = FaqService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(faq_schema_1.Faq.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        activity_service_1.ActivityService])
], FaqService);
//# sourceMappingURL=faq.service.js.map