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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const BREVO_BASE = 'https://api.brevo.com/v3';
let EmailService = EmailService_1 = class EmailService {
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.apiKey = config.get('brevo.apiKey');
        this.senderEmail = config.get('brevo.senderEmail');
        this.senderName = config.get('brevo.senderName') ?? 'TechClues';
        this.listId = config.get('brevo.listId');
        if (!this.apiKey || !this.senderEmail) {
            this.logger.warn('Brevo not fully configured — emails will be logged, not sent');
        }
    }
    headers() {
        return { 'api-key': this.apiKey, 'Content-Type': 'application/json' };
    }
    async send(options) {
        if (!this.apiKey || !this.senderEmail) {
            this.logger.log(`[dev-mode email] to=${options.to.map((t) => t.email).join(',')} subject="${options.subject}"`);
            return { skipped: true };
        }
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.post(`${BREVO_BASE}/smtp/email`, {
                sender: { email: this.senderEmail, name: this.senderName },
                to: options.to,
                subject: options.subject,
                htmlContent: options.htmlContent,
                textContent: options.textContent,
                replyTo: options.replyTo,
                attachment: options.attachments,
                headers: options.headers,
            }, { headers: this.headers() }));
            return data;
        }
        catch (err) {
            this.logger.error('Failed to send email via Brevo', err.message);
            throw err;
        }
    }
    async upsertContact(email, attributes, listIds) {
        if (!this.apiKey)
            return { skipped: true };
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.post(`${BREVO_BASE}/contacts`, {
                email,
                attributes,
                listIds: listIds ?? (this.listId ? [this.listId] : undefined),
                updateEnabled: true,
            }, { headers: this.headers() }));
            return data;
        }
        catch (err) {
            this.logger.error(`Failed to upsert Brevo contact ${email}`, err.message);
            return null;
        }
    }
    async removeFromList(email) {
        if (!this.apiKey || !this.listId)
            return;
        try {
            await (0, rxjs_1.firstValueFrom)(this.http.post(`${BREVO_BASE}/contacts/lists/${this.listId}/contacts/remove`, { emails: [email] }, { headers: this.headers() }));
        }
        catch (err) {
            this.logger.error(`Failed to remove ${email} from Brevo list`, err.message);
        }
    }
    async deleteContact(email) {
        if (!this.apiKey)
            return;
        try {
            await (0, rxjs_1.firstValueFrom)(this.http.delete(`${BREVO_BASE}/contacts/${encodeURIComponent(email)}`, {
                headers: this.headers(),
            }));
        }
        catch (err) {
            this.logger.error(`Failed to delete Brevo contact ${email}`, err.message);
        }
    }
    async ensureList(name) {
        if (this.listId)
            return this.listId;
        if (!this.apiKey)
            return undefined;
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${BREVO_BASE}/contacts/lists`, { headers: this.headers() }));
            const existing = data?.lists?.find((l) => l.name === name);
            if (existing)
                return existing.id;
            const created = await (0, rxjs_1.firstValueFrom)(this.http.post(`${BREVO_BASE}/contacts/lists`, { name, folderId: 1 }, { headers: this.headers() }));
            return created.data?.id;
        }
        catch (err) {
            this.logger.error('Failed to ensure Brevo list exists', err.message);
            return undefined;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map