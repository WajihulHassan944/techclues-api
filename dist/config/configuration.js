"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const effectiveEnv = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
exports.default = () => ({
    nodeEnv: effectiveEnv,
    port: parseInt(process.env.PORT ?? '4000', 10),
    admin: {
        email: process.env.ADMIN_EMAIL,
        passwordHash: process.env.ADMIN_PASSWORD_HASH,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
        refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
    },
    notifyEmail: process.env.NOTIFY_EMAIL,
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    mongo: {
        uri: effectiveEnv === 'production'
            ? process.env.MONGODB_URI
            : (process.env.MONGODB_URI_DEV ?? process.env.MONGODB_URI),
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    brevo: {
        apiKey: process.env.BREVO_API_KEY,
        senderEmail: process.env.BREVO_SENDER_EMAIL,
        senderName: process.env.BREVO_SENDER_NAME ?? 'TechClues',
        listId: process.env.BREVO_LIST_ID ? parseInt(process.env.BREVO_LIST_ID, 10) : undefined,
    },
    pusher: {
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER,
    },
    turnstileSecret: process.env.TURNSTILE_SECRET,
});
//# sourceMappingURL=configuration.js.map