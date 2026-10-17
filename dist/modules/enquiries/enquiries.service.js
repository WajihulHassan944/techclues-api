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
exports.EnquiriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enquiry_schema_1 = require("../../database/schemas/enquiry.schema");
const blocked_sender_schema_1 = require("../../database/schemas/blocked-sender.schema");
const activity_service_1 = require("../activity/activity.service");
const settings_service_1 = require("../settings/settings.service");
const email_service_1 = require("../email/email.service");
const pusher_service_1 = require("../pusher/pusher.service");
const notifications_service_1 = require("../notifications/notifications.service");
const newsletter_service_1 = require("../newsletter/newsletter.service");
const defaults_1 = require("../../common/constants/defaults");
const templates_1 = require("../email/templates");
let EnquiriesService = class EnquiriesService {
    constructor(model, blockedModel, activity, settings, email, pusher, notifications, newsletter) {
        this.model = model;
        this.blockedModel = blockedModel;
        this.activity = activity;
        this.settings = settings;
        this.email = email;
        this.pusher = pusher;
        this.notifications = notifications;
        this.newsletter = newsletter;
    }
    async createPublic(input) {
        const blocked = await this.blockedModel.findOne({ email: input.email.toLowerCase() });
        const enquiry = await this.model.create({
            ...input,
            email: input.email.toLowerCase(),
            received: new Date(),
            status: 'new',
            folder: blocked ? 'spam' : 'inbox',
        });
        const settings = await this.settings.get();
        if (!blocked && input.marketingConsent !== false) {
            this.newsletter
                .autoAdd(enquiry.email, (0, defaults_1.firstName)(enquiry.name), 'contact')
                .catch(() => undefined);
        }
        if (!blocked) {
            await this.pusher.trigger('enquiry.created', {
                id: String(enquiry._id),
                name: enquiry.name,
                subject: enquiry.subject,
                source: enquiry.source,
            });
            await this.notifications.create('enquiry', `New enquiry from ${enquiry.name}: ${enquiry.subject}`, `/admin/inbox/${enquiry._id}`);
            if (settings.events.enquiry) {
                const mail = (0, templates_1.enquiryAdminEmail)(enquiry);
                await this.email.send({
                    to: settings.recipients.map((email) => ({ email })),
                    subject: mail.subject,
                    htmlContent: mail.html,
                    textContent: mail.text,
                });
            }
            const autoReplyTemplate = settings.templates.find((t) => !t.sources || t.sources.includes(input.source));
            if (autoReplyTemplate) {
                const mail = (0, templates_1.autoReplyEmail)((0, defaults_1.firstName)(enquiry.name), (0, defaults_1.fillTemplate)(autoReplyTemplate.body, enquiry.name), settings);
                await this.email.send({
                    to: [{ email: enquiry.email, name: enquiry.name }],
                    subject: mail.subject,
                    htmlContent: mail.html,
                    textContent: mail.text,
                    replyTo: { email: settings.recipients[0] },
                });
            }
        }
        await this.activity.log('inbox', `New ${input.source} enquiry from ${input.name}`);
        return enquiry;
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.NotFoundException('Enquiry not found');
        const doc = await this.model.findById(id);
        if (!doc)
            throw new common_1.NotFoundException('Enquiry not found');
        return doc;
    }
    async list(query) {
        const filter = {};
        if (query.folder)
            filter.folder = query.folder;
        if (query.status)
            filter.status = query.status;
        if (query.search)
            filter.$text = { $search: query.search };
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const [items, total] = await Promise.all([
            this.model
                .find(filter)
                .sort({ received: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            this.model.countDocuments(filter),
        ]);
        return { items, total, page, pageSize };
    }
    async unreadCount() {
        return this.model.countDocuments({ folder: 'inbox', read: false });
    }
    async setRead(ids, read) {
        await this.model.updateMany({ _id: { $in: ids } }, { read });
    }
    async toggleStar(id) {
        const doc = await this.findOne(id);
        doc.starred = !doc.starred;
        await doc.save();
        return doc;
    }
    async setStatus(ids, status) {
        await this.model.updateMany({ _id: { $in: ids } }, { status });
        await this.activity.log('inbox', `Marked ${ids.length} enquiry(ies) as ${status}`);
    }
    async moveTo(ids, folder) {
        const patch = { folder };
        if (folder === 'trash' || folder === 'spam')
            patch.folderSince = new Date();
        await this.model.updateMany({ _id: { $in: ids } }, patch);
        await this.activity.log('inbox', `Moved ${ids.length} enquiry(ies) to ${folder}`);
    }
    async deleteForever(ids) {
        await this.model.deleteMany({ _id: { $in: ids } });
        await this.activity.log('inbox', `Permanently deleted ${ids.length} enquiry(ies)`);
    }
    async addNote(id, body) {
        const doc = await this.findOne(id);
        doc.notes.push({ at: new Date(), body });
        await doc.save();
        await this.activity.log('inbox', `Added a note to ${doc.name}'s enquiry`);
        return doc;
    }
    async saveDraft(id, draft) {
        const doc = await this.findOne(id);
        doc.draft = draft;
        await doc.save();
        return doc;
    }
    async sendReply(id, body) {
        const doc = await this.findOne(id);
        const settings = await this.settings.get();
        const mail = (0, templates_1.enquiryReplyEmail)((0, defaults_1.firstName)(doc.name), body, { name: doc.name, message: doc.message }, settings);
        const originalMessageId = `<enquiry-${doc._id}@techclues.co.uk>`;
        const replyMessageId = `<enquiry-${doc._id}-${doc.thread.length}@techclues.co.uk>`;
        try {
            await this.email.send({
                to: [{ email: doc.email, name: doc.name }],
                subject: `Re: ${doc.subject}`,
                htmlContent: mail.html,
                textContent: mail.text,
                replyTo: { email: settings.recipients[0], name: settings.fromName },
                headers: {
                    'Message-ID': replyMessageId,
                    'In-Reply-To': originalMessageId,
                    References: originalMessageId,
                },
            });
            doc.thread.push({ from: 'us', at: new Date(), body, deliveryStatus: 'sent' });
            doc.status = 'replied';
            doc.draft = undefined;
        }
        catch {
            doc.thread.push({ from: 'us', at: new Date(), body, deliveryStatus: 'failed' });
            await doc.save();
            await this.notifications.create('reply-failed', `Reply to ${doc.name} failed to send`, `/admin/inbox/${doc._id}`);
            throw new common_1.BadRequestException('Failed to send reply email');
        }
        await doc.save();
        await this.pusher.trigger('reply.sent', { id: String(doc._id) });
        await this.activity.log('inbox', `Replied to ${doc.name}'s enquiry`);
        return doc;
    }
    async listBlocked() {
        return this.blockedModel.find().sort({ at: -1 }).lean();
    }
    async block(email) {
        await this.blockedModel.updateOne({ email: email.toLowerCase() }, { email: email.toLowerCase(), at: new Date() }, { upsert: true });
        await this.activity.log('inbox', `Blocked sender ${email}`);
    }
    async unblock(email) {
        await this.blockedModel.deleteOne({ email: email.toLowerCase() });
        await this.activity.log('inbox', `Unblocked sender ${email}`);
    }
    async deleteByEmail(email) {
        const result = await this.model.deleteMany({ email: email.toLowerCase() });
        return result.deletedCount ?? 0;
    }
    async findByEmail(email) {
        return this.model.find({ email: email.toLowerCase() }).lean();
    }
    async purgeOldSpam() {
        const settings = await this.settings.get();
        const days = settings.retention.spamDays;
        if (!days || days <= 0)
            return 0;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const result = await this.model.deleteMany({ folder: 'spam', folderSince: { $lte: cutoff } });
        return result.deletedCount ?? 0;
    }
};
exports.EnquiriesService = EnquiriesService;
exports.EnquiriesService = EnquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(enquiry_schema_1.Enquiry.name)),
    __param(1, (0, mongoose_1.InjectModel)(blocked_sender_schema_1.BlockedSender.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        activity_service_1.ActivityService,
        settings_service_1.SettingsService,
        email_service_1.EmailService,
        pusher_service_1.PusherService,
        notifications_service_1.NotificationsService,
        newsletter_service_1.NewsletterService])
], EnquiriesService);
//# sourceMappingURL=enquiries.service.js.map