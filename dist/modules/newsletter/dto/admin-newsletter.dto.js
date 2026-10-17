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
exports.AddManySubscribersDto = exports.DeleteByEmailDto = exports.ImportCsvDto = exports.RemoveSubscribersDto = exports.SetSubStatusDto = exports.AddSubscriberDto = void 0;
const class_validator_1 = require("class-validator");
const subscriber_schema_1 = require("../../../database/schemas/subscriber.schema");
class AddSubscriberDto {
}
exports.AddSubscriberDto = AddSubscriberDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AddSubscriberDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddSubscriberDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsIn)(subscriber_schema_1.SUB_SOURCES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AddSubscriberDto.prototype, "source", void 0);
class SetSubStatusDto {
}
exports.SetSubStatusDto = SetSubStatusDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SetSubStatusDto.prototype, "ids", void 0);
__decorate([
    (0, class_validator_1.IsIn)(subscriber_schema_1.SUB_STATUSES),
    __metadata("design:type", Object)
], SetSubStatusDto.prototype, "status", void 0);
class RemoveSubscribersDto {
}
exports.RemoveSubscribersDto = RemoveSubscribersDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RemoveSubscribersDto.prototype, "ids", void 0);
class ImportCsvDto {
}
exports.ImportCsvDto = ImportCsvDto;
__decorate([
    (0, class_validator_1.IsIn)(subscriber_schema_1.SUB_SOURCES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ImportCsvDto.prototype, "source", void 0);
class DeleteByEmailDto {
}
exports.DeleteByEmailDto = DeleteByEmailDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], DeleteByEmailDto.prototype, "email", void 0);
class AddManySubscribersDto {
}
exports.AddManySubscribersDto = AddManySubscribersDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AddManySubscribersDto.prototype, "emails", void 0);
__decorate([
    (0, class_validator_1.IsIn)(subscriber_schema_1.SUB_SOURCES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AddManySubscribersDto.prototype, "source", void 0);
//# sourceMappingURL=admin-newsletter.dto.js.map