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
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = class CloudinaryService {
    constructor(config) {
        this.config = config;
        cloudinary_1.v2.config({
            cloud_name: config.get('cloudinary.cloudName'),
            api_key: config.get('cloudinary.apiKey'),
            api_secret: config.get('cloudinary.apiSecret'),
        });
    }
    createSignature(folder = 'techclues/blog') {
        const timestamp = Math.round(Date.now() / 1000);
        const apiSecret = this.config.get('cloudinary.apiSecret');
        const paramsToSign = { timestamp, folder };
        const signature = cloudinary_1.v2.utils.api_sign_request(paramsToSign, apiSecret);
        return {
            timestamp,
            signature,
            apiKey: this.config.get('cloudinary.apiKey'),
            cloudName: this.config.get('cloudinary.cloudName'),
            folder,
        };
    }
    async uploadBuffer(buffer, folder = 'techclues/blog') {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({ folder }, (error, result) => {
                if (error || !result)
                    return reject(error ?? new Error('Upload failed'));
                resolve({ url: result.secure_url, publicId: result.public_id });
            });
            stream.end(buffer);
        });
    }
    async destroy(publicId) {
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map