"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHoneypot = checkHoneypot;
const common_1 = require("@nestjs/common");
function checkHoneypot(value) {
    if (typeof value === 'string' && value.trim().length > 0) {
        throw new common_1.BadRequestException('Unable to process submission');
    }
}
//# sourceMappingURL=honeypot.js.map