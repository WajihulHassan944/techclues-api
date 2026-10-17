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
exports.NewsletterService = exports.EMAIL_RE = void 0;
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sync_1 = require("csv-stringify/sync");
const sync_2 = require("csv-parse/sync");
const subscriber_schema_1 = require("../../database/schemas/subscriber.schema");
const activity_service_1 = require("../activity/activity.service");
const email_service_1 = require("../email/email.service");
const pusher_service_1 = require("../pusher/pusher.service");
const notifications_service_1 = require("../notifications/notifications.service");
const settings_service_1 = require("../settings/settings.service");
const templates_1 = require("../email/templates");
exports.EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const SOURCE_LABELS = {
    footer: 'Footer',
    blog: 'Blog',
    manual: 'Manual',
    import: 'Import',
    contact: 'Contact form',
    booking: 'Booking',
};
const STATUS_LABELS = {
    subscribed: 'Subscribed',
    unsubscribed: 'Unsubscribed',
    bounced: 'Bounced',
};
let NewsletterService = class NewsletterService {
    constructor(model, activity, email, pusher, settings, notifications) {
        this.model = model;
        this.activity = activity;
        this.email = email;
        this.pusher = pusher;
        this.settings = settings;
        this.notifications = notifications;
    }
    async add(email, name, source) {
        const normalized = email.trim().toLowerCase();
        if (!exports.EMAIL_RE.test(normalized))
            return 'Enter a valid email address';
        const existing = await this.model.findOne({ email: normalized });
        let unsubscribeToken;
        if (existing) {
            if (existing.status === 'subscribed')
                return 'That email is already subscribed';
            existing.status = 'subscribed';
            existing.endedAt = undefined;
            existing.name = name ?? existing.name;
            await existing.save();
            unsubscribeToken = existing.unsubscribeToken;
        }
        else {
            unsubscribeToken = (0, crypto_1.randomBytes)(24).toString('hex');
            await this.model.create({
                email: normalized,
                name,
                source,
                status: 'subscribed',
                at: new Date(),
                unsubscribeToken,
            });
        }
        await this.email.upsertContact(normalized, { FIRSTNAME: name });
        const settings = await this.settings.get();
        await this.pusher.trigger('subscriber.created', { email: normalized });
        await this.notifications.create('subscriber', `New subscriber: ${normalized}`, '/admin/newsletter');
        if (settings.events.subscriber) {
            const mail = (0, templates_1.subscriberAdminEmail)(`${normalized} subscribed via ${source}.`);
            await this.email.send({
                to: settings.recipients.map((e) => ({ email: e })),
                subject: mail.subject,
                htmlContent: mail.html,
                textContent: mail.text,
            });
        }
        const welcome = (0, templates_1.newsletterWelcomeEmail)(normalized, unsubscribeToken, settings);
        await this.email.send({
            to: [{ email: normalized, name }],
            subject: welcome.subject,
            htmlContent: welcome.html,
            textContent: welcome.text,
        });
        await this.activity.log('newsletter', `${normalized} subscribed via ${source}`);
        return '';
    }
    async autoAdd(email, name, source) {
        const normalized = email.trim().toLowerCase();
        if (!exports.EMAIL_RE.test(normalized))
            return;
        const existing = await this.model.findOne({ email: normalized });
        if (existing)
            return;
        await this.model.create({
            email: normalized,
            name,
            source,
            status: 'subscribed',
            at: new Date(),
            unsubscribeToken: (0, crypto_1.randomBytes)(24).toString('hex'),
        });
        await this.email.upsertContact(normalized, { FIRSTNAME: name });
        await this.activity.log('newsletter', `${normalized} added to the newsletter after contacting us`);
    }
    async addMany(emails, source) {
        let added = 0;
        let existingCount = 0;
        let invalid = 0;
        for (const raw of emails) {
            const normalized = raw.trim().toLowerCase();
            if (!exports.EMAIL_RE.test(normalized)) {
                invalid += 1;
                continue;
            }
            const existing = await this.model.findOne({ email: normalized });
            if (existing) {
                existingCount += 1;
                continue;
            }
            await this.model.create({
                email: normalized,
                source,
                status: 'subscribed',
                at: new Date(),
                unsubscribeToken: (0, crypto_1.randomBytes)(24).toString('hex'),
            });
            await this.email.upsertContact(normalized);
            added += 1;
        }
        if (added > 0) {
            await this.pusher.trigger('subscriber.created', { email: `${added} imported` });
            await this.notifications.create('subscriber', `${added} subscriber(s) imported`, '/admin/newsletter');
        }
        await this.activity.log('newsletter', `Imported ${added} new subscriber(s)`);
        return { added, existing: existingCount, invalid };
    }
    async importCsv(buffer, source) {
        const records = (0, sync_2.parse)(buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
        const emails = records
            .map((r) => r.Email ?? r.email ?? Object.values(r)[0])
            .filter((v) => Boolean(v));
        return this.addMany(emails, source);
    }
    async exportCsv(query = {}) {
        const filter = {};
        if (query.status)
            filter.status = query.status;
        if (query.source)
            filter.source = query.source;
        if (query.search)
            filter.email = { $regex: query.search, $options: 'i' };
        const rows = await this.model.find(filter).sort({ at: -1 }).lean();
        const data = rows.map((r) => [
            r.email,
            r.name ?? '',
            SOURCE_LABELS[r.source],
            STATUS_LABELS[r.status],
            new Date(r.at).toISOString().slice(0, 10),
            r.endedAt ? new Date(r.endedAt).toISOString().slice(0, 10) : '',
        ]);
        return (0, sync_1.stringify)([['Email', 'Name', 'Source', 'Status', 'Subscribed on', 'Ended on'], ...data]);
    }
    async list(query) {
        const filter = {};
        if (query.status)
            filter.status = query.status;
        if (query.search)
            filter.email = { $regex: query.search, $options: 'i' };
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const [items, total] = await Promise.all([
            this.model
                .find(filter)
                .sort({ at: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            this.model.countDocuments(filter),
        ]);
        return { items, total, page, pageSize };
    }
    async setStatus(ids, status) {
        const patch = { status };
        if (status !== 'subscribed')
            patch.endedAt = new Date();
        else
            patch.endedAt = undefined;
        await this.model.updateMany({ _id: { $in: ids } }, patch);
        await this.activity.log('newsletter', `Marked ${ids.length} subscriber(s) as ${status}`);
    }
    async remove(ids) {
        await this.model.deleteMany({ _id: { $in: ids } });
        await this.activity.log('newsletter', `Removed ${ids.length} subscriber(s)`);
    }
    async deleteByEmail(email) {
        const result = await this.model.deleteMany({ email: email.toLowerCase() });
        await this.email.removeFromList(email.toLowerCase());
        return result.deletedCount ?? 0;
    }
    async findByEmail(email) {
        return this.model.find({ email: email.toLowerCase() }).lean();
    }
    async unsubscribeByToken(token) {
        const sub = await this.model.findOne({ unsubscribeToken: token });
        if (!sub)
            throw new common_1.NotFoundException('Invalid or expired unsubscribe link');
        sub.status = 'unsubscribed';
        sub.endedAt = new Date();
        await sub.save();
        await this.email.removeFromList(sub.email);
        const settings = await this.settings.get();
        const mail = (0, templates_1.newsletterUnsubscribeEmail)(sub.email, settings);
        await this.email.send({
            to: [{ email: sub.email, name: sub.name }],
            subject: mail.subject,
            htmlContent: mail.html,
            textContent: mail.text,
        });
        await this.activity.log('newsletter', `${sub.email} unsubscribed`);
        return sub;
    }
    async growthStats() {
        const subs = await this.model.find().sort({ at: 1 }).lean();
        const byMonth = new Map();
        for (const s of subs) {
            const month = new Date(s.at).toISOString().slice(0, 7);
            byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
        }
        return {
            total: subs.length,
            subscribed: subs.filter((s) => s.status === 'subscribed').length,
            unsubscribed: subs.filter((s) => s.status === 'unsubscribed').length,
            bounced: subs.filter((s) => s.status === 'bounced').length,
            bySource: Object.fromEntries(['footer', 'blog', 'manual', 'import'].map((src) => [
                src,
                subs.filter((s) => s.source === src).length,
            ])),
            signupsByMonth: Object.fromEntries(byMonth),
        };
    }
};
exports.NewsletterService = NewsletterService;
exports.NewsletterService = NewsletterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscriber_schema_1.Subscriber.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        activity_service_1.ActivityService,
        email_service_1.EmailService,
        pusher_service_1.PusherService,
        settings_service_1.SettingsService,
        notifications_service_1.NotificationsService])
], NewsletterService);
//# sourceMappingURL=newsletter.service.js.map