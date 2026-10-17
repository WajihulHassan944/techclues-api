"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeDevice = describeDevice;
function describeDevice(userAgent) {
    if (!userAgent)
        return 'Unknown device';
    const ua = userAgent;
    const os = ua.includes('Windows')
        ? 'Windows'
        : ua.includes('Mac OS X')
            ? 'macOS'
            : ua.includes('Android')
                ? 'Android'
                : /iPhone|iPad|iPod/.test(ua)
                    ? 'iOS'
                    : ua.includes('Linux')
                        ? 'Linux'
                        : 'an unknown OS';
    const browser = ua.includes('Edg/')
        ? 'Edge'
        : ua.includes('Chrome/') && !ua.includes('Chromium')
            ? 'Chrome'
            : ua.includes('Firefox/')
                ? 'Firefox'
                : ua.includes('Safari/') && !ua.includes('Chrome')
                    ? 'Safari'
                    : 'an unknown browser';
    return `${browser} on ${os}`;
}
//# sourceMappingURL=user-agent.js.map