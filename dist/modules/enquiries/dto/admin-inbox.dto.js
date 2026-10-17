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
exports.BlockEmailDto = exports.SaveDraftDto = exports.SendReplyDto = exports.AddNoteDto = exports.MoveFolderDto = exports.SetStatusDto = exports.SetReadDto = exports.BulkIdsDto = void 0;
const class_validator_1 = require("class-validator");
const enquiry_schema_1 = require("../../../database/schemas/enquiry.schema");
class BulkIdsDto {
}
exports.BulkIdsDto = BulkIdsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkIdsDto.prototype, "ids", void 0);
class SetReadDto extends BulkIdsDto {
}
exports.SetReadDto = SetReadDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetReadDto.prototype, "read", void 0);
class SetStatusDto extends BulkIdsDto {
}
exports.SetStatusDto = SetStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(enquiry_schema_1.STATUS_KEYS),
    __metadata("design:type", Object)
], SetStatusDto.prototype, "status", void 0);
class MoveFolderDto extends BulkIdsDto {
}
exports.MoveFolderDto = MoveFolderDto;
__decorate([
    (0, class_validator_1.IsIn)(enquiry_schema_1.FOLDERS),
    __metadata("design:type", Object)
], MoveFolderDto.prototype, "folder", void 0);
class AddNoteDto {
}
exports.AddNoteDto = AddNoteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddNoteDto.prototype, "body", void 0);
class SendReplyDto {
}
exports.SendReplyDto = SendReplyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendReplyDto.prototype, "body", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendReplyDto.prototype, "templateId", void 0);
class SaveDraftDto {
}
exports.SaveDraftDto = SaveDraftDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDraftDto.prototype, "draft", void 0);
class BlockEmailDto {
}
exports.BlockEmailDto = BlockEmailDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockEmailDto.prototype, "email", void 0);
//# sourceMappingURL=admin-inbox.dto.js.map