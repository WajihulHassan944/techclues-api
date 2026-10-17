"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrap_1 = require("./bootstrap");
async function bootstrap() {
    const app = await (0, bootstrap_1.createApp)();
    const port = process.env.PORT ?? 4000;
    await app.listen(port);
    console.log(`TechClues API listening on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map