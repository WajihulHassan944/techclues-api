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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicFaqController = void 0;
const common_1 = require("@nestjs/common");
const faq_service_1 = require("./faq.service");
let PublicFaqController = class PublicFaqController {
    constructor(faqs) {
        this.faqs = faqs;
    }
    list() {
        return this.faqs.listPublicGrouped();
    }
};
exports.PublicFaqController = PublicFaqController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicFaqController.prototype, "list", null);
exports.PublicFaqController = PublicFaqController = __decorate([
    (0, common_1.Controller)('public/faqs'),
    __metadata("design:paramtypes", [faq_service_1.FaqService])
], PublicFaqController);
//# sourceMappingURL=public-faq.controller.js.map