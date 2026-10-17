"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const dns_1 = __importDefault(require("dns"));
const mongoose_1 = __importDefault(require("mongoose"));
const faq_schema_1 = require("./schemas/faq.schema");
const faqs_data_json_1 = __importDefault(require("./data/faqs-data.json"));
dns_1.default.setServers(['1.1.1.1', '8.8.8.8']);
async function main() {
    const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URI_DEV;
    if (!uri) {
        console.error('Set MONGODB_URI (or MONGODB_URI_DEV) to run this migration.');
        process.exit(1);
    }
    await mongoose_1.default.connect(uri);
    console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);
    const Faq = mongoose_1.default.model('Faq', faq_schema_1.FaqSchema);
    const existing = await Faq.countDocuments();
    if (existing > 0 && !process.argv.includes('--force')) {
        console.log(`Faq collection already has ${existing} document(s) — skipping. Pass --force to wipe and reseed.`);
        await mongoose_1.default.disconnect();
        return;
    }
    if (existing > 0) {
        await Faq.deleteMany({});
        console.log(`Cleared ${existing} existing FAQ(s).`);
    }
    const groups = faqs_data_json_1.default;
    const docs = [];
    for (const [group, items] of Object.entries(groups)) {
        items.forEach((item, i) => {
            docs.push({ group, question: item.q, answer: item.a, order: i, published: true });
        });
    }
    await Faq.insertMany(docs);
    console.log(`Inserted ${docs.length} FAQs across ${Object.keys(groups).length} groups.`);
    await mongoose_1.default.disconnect();
    console.log('Done.');
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=migrate-faqs.js.map