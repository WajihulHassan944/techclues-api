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
exports.PublicGameDevelopmentDto = exports.PublicStaffAugmentationDto = exports.GAME_NEEDS = exports.STAFF_NEEDS = void 0;
const class_validator_1 = require("class-validator");
exports.STAFF_NEEDS = [
    'One specialist',
    'A full team',
    'Short-term coverage',
    'Not sure yet',
];
exports.GAME_NEEDS = [
    'Just a concept',
    'Prototype or vertical slice built',
    'In production, need capacity',
    'Live title, need live ops',
];
class ServiceLeadBase {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], ServiceLeadBase.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], ServiceLeadBase.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ServiceLeadBase.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], ServiceLeadBase.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(8),
    __metadata("design:type", String)
], ServiceLeadBase.prototype, "phoneCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], ServiceLeadBase.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], ServiceLeadBase.prototype, "brief", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ServiceLeadBase.prototype, "consent", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ServiceLeadBase.prototype, "marketingConsent", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ServiceLeadBase.prototype, "website", void 0);
class PublicStaffAugmentationDto extends ServiceLeadBase {
}
exports.PublicStaffAugmentationDto = PublicStaffAugmentationDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.STAFF_NEEDS),
    __metadata("design:type", String)
], PublicStaffAugmentationDto.prototype, "need", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublicStaffAugmentationDto.prototype, "companySize", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublicStaffAugmentationDto.prototype, "timeline", void 0);
class PublicGameDevelopmentDto extends ServiceLeadBase {
}
exports.PublicGameDevelopmentDto = PublicGameDevelopmentDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.GAME_NEEDS),
    __metadata("design:type", String)
], PublicGameDevelopmentDto.prototype, "need", void 0);
//# sourceMappingURL=public-service-lead.dto.js.map