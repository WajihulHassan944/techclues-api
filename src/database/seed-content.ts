/* eslint-disable no-console */
// One-off, idempotent content seed: populates the live blog (10 published posts), case studies
// (10 published entries) and the footer's link groups, none of which have ever been populated in
// production — blog/case-studies launched empty by design (see PROGRESS.md), and the footer was
// hardcoded markup until the footer-links admin module existed. Safe to re-run: every write is
// upserted by a stable key (slug, or group+label for footer links), so running it again just
// reconciles rather than duplicating. Run with `npm run seed:content`.
import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { BlogPostSchema, BlogCategorySchema, BlogAuthorSchema } from './schemas/blog.schema';
import { CaseStudySchema } from './schemas/case-study.schema';
import { FooterLinkSchema } from './schemas/footer-link.schema';
import { BODIES } from './seed-blog-bodies';
import { BODIES2 } from './seed-blog-bodies-2';
import { CASE_STUDIES } from './seed-case-studies-data';
import { CASE_STUDIES_2 } from './seed-case-studies-data-2';

// Mirrors migrate-faqs.ts: some local/corporate DNS resolvers can't do the SRV + TXT lookups
// `mongodb+srv://` needs, even though the OS resolver handles them fine.
dns.setServers(['1.1.1.1', '8.8.8.8']);

const BLOG_POSTS = [
  {
    slug: 'mvp-software-development-age-of-ai',
    title: 'MVP Software Development in the Age of AI',
    category: 'AI',
    excerpt:
      'MVP software development helps startups test ideas with real users, cut costs, and use AI tools to move fast without overbuilding.',
    cover: '/images/media/mvp-software-development-techclues.webp',
    coverAlt: 'MVP Software Development',
    body: BODIES['mvp-software-development-age-of-ai'],
    publishedAt: new Date('2026-10-06T09:00:00Z'),
    seoTitle: 'MVP Software Development in the Age of AI | TechClues',
    seoDescription:
      'Most startups fail because they build too much, too early. MVP software development is how you validate before you commit.',
  },
  {
    slug: 'ai-funding-uk-scotland',
    title: 'Funding for AI projects in the UK and Scotland',
    category: 'Funding',
    excerpt:
      "What's actually open to UK and Scottish businesses that want to use AI, and how to plan a project that doesn't depend on a grant.",
    cover: '/images/blog/ai-funding.jpg',
    coverAlt: 'Victorian and modern buildings side by side in Glasgow',
    body: BODIES['ai-funding-uk-scotland'],
    publishedAt: new Date('2026-09-25T09:00:00Z'),
    seoTitle: 'AI Funding for UK & Scottish Businesses (2026) | TechClues',
    seoDescription:
      "What's actually open to UK and Scottish businesses that want to use AI, including what's paused.",
  },
  {
    slug: 'mvp-cost-uk',
    title: 'How much does an MVP cost in the UK?',
    category: 'Costs',
    excerpt:
      'What an MVP budget pays for, the four choices that move the price most, and the costs founders forget.',
    cover: '/images/services/mvp.jpg',
    coverAlt: 'A team planning a product together at a whiteboard',
    body: BODIES['mvp-cost-uk'],
    publishedAt: new Date('2026-09-10T09:00:00Z'),
    seoTitle: 'MVP Cost in UK and How Much Startups Should Budget | TechClues',
    seoDescription: 'Find out the MVP cost in UK and what drives the price.',
  },
  {
    slug: 'prototype-vs-mvp',
    title: 'Prototype vs MVP: which one do you need?',
    category: 'Strategy',
    excerpt:
      'A prototype answers "can we build it?" and an MVP answers "will anyone use it?". Here\'s how to choose.',
    cover: '/images/blog/product-strategy.jpg',
    coverAlt: 'Sticky notes mapping out a product plan',
    body: BODIES2['prototype-vs-mvp'],
    publishedAt: new Date('2026-08-20T09:00:00Z'),
    seoTitle: 'Prototype vs MVP: Which One Do You Need? | TechClues',
    seoDescription:
      'A prototype answers whether you can build it. An MVP answers whether anyone wants it. Here is how to tell which stage you are at.',
  },
  {
    slug: 'validate-startup-idea-before-development',
    title: 'How to validate a startup idea before you write any code',
    category: 'Validation',
    excerpt: 'Five cheap ways to find out whether people want your idea, before you build it.',
    cover: '/images/blog/idea-validation.jpg',
    coverAlt: 'A founder sketching a product idea on a notepad',
    body: BODIES2['validate-startup-idea-before-development'],
    publishedAt: new Date('2026-08-05T09:00:00Z'),
    seoTitle: 'How to Validate a Startup Idea Before Development | TechClues',
    seoDescription:
      'Five cheap, practical ways to validate a startup idea before committing to development.',
  },
  {
    slug: 'no-code-vs-custom-development',
    title: 'No-code or custom code for your MVP?',
    category: 'Building',
    excerpt: 'When no-code platforms are the smart choice, and when custom code is worth it.',
    cover: '/images/services/lowcode.jpg',
    coverAlt: 'A no-code app builder interface on a laptop',
    body: BODIES2['no-code-vs-custom-development'],
    publishedAt: new Date('2026-07-22T09:00:00Z'),
    seoTitle: 'No-Code or Custom Development for Your MVP? | TechClues',
    seoDescription:
      'When no-code platforms are the smart MVP choice, and when custom code is worth the extra investment.',
  },
  {
    slug: 'choosing-mvp-agency-uk',
    title: 'How to choose an MVP development agency in the UK',
    category: 'Strategy',
    excerpt:
      'What actually separates a good MVP agency from a bad one, and the questions worth asking before you sign.',
    cover: '/images/company/team-meeting.jpg',
    coverAlt: 'A founder meeting with a development team',
    body: BODIES2['choosing-mvp-agency-uk'],
    publishedAt: new Date('2026-07-08T09:00:00Z'),
    seoTitle: 'How to Choose an MVP Development Agency in the UK | TechClues',
    seoDescription:
      'What separates a good MVP development agency from a bad one, and the questions worth asking before you sign.',
  },
  {
    slug: 'mvp-first-version-scope',
    title: "What to include in your MVP's first version (and what to cut)",
    category: 'Building',
    excerpt:
      'A simple test for deciding what belongs in version one of your MVP, and what can safely wait.',
    cover: '/images/services/apps.jpg',
    coverAlt: 'A product roadmap sketched on a whiteboard',
    body: BODIES2['mvp-first-version-scope'],
    publishedAt: new Date('2026-06-24T09:00:00Z'),
    seoTitle: "What to Include in Your MVP's First Version | TechClues",
    seoDescription:
      'A simple test for deciding what belongs in version one of your MVP, and what can safely wait until later.',
  },
  {
    slug: 'ai-features-mvp-2026',
    title: 'AI features worth adding to your MVP in 2026',
    category: 'AI',
    excerpt:
      'Where an AI feature genuinely strengthens an MVP, and where it is just scope creep with a new label.',
    cover: '/images/services/ai.jpg',
    coverAlt: 'An AI-assisted product interface on a laptop',
    body: BODIES2['ai-features-mvp-2026'],
    publishedAt: new Date('2026-06-10T09:00:00Z'),
    seoTitle: 'AI Features Worth Adding to Your MVP in 2026 | TechClues',
    seoDescription:
      'Where an AI feature genuinely strengthens an early-stage MVP, and where it is scope creep with a new label.',
  },
  {
    slug: 'fixed-price-vs-time-materials',
    title: 'Fixed price vs time and materials: how agencies price MVP projects',
    category: 'Costs',
    excerpt:
      'Fixed price feels safer, but it is not always the better choice for genuine MVP work. Here is how both models actually work.',
    cover: '/images/services/mvp.jpg',
    coverAlt: 'A quote and invoice on a desk next to a laptop',
    body: BODIES2['fixed-price-vs-time-materials'],
    publishedAt: new Date('2026-05-27T09:00:00Z'),
    seoTitle: 'Fixed Price vs Time & Materials for MVP Projects | TechClues',
    seoDescription:
      'How fixed-price and time-and-materials pricing actually work for MVP development, and which fits a real MVP engagement.',
  },
];

async function main() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URI_DEV;
  if (!uri) {
    console.error('Set MONGODB_URI (or MONGODB_URI_DEV) to run this seed.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);

  const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
  const BlogCategory = mongoose.model('BlogCategory', BlogCategorySchema);
  const BlogAuthor = mongoose.model('BlogAuthor', BlogAuthorSchema);
  const CaseStudy = mongoose.model('CaseStudy', CaseStudySchema);
  const FooterLink = mongoose.model('FooterLink', FooterLinkSchema);

  // --- Blog: categories + author ---
  const categoryNames = [...new Set(BLOG_POSTS.map((p) => p.category))];
  for (const name of categoryNames) {
    await BlogCategory.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
  console.log(`Ensured ${categoryNames.length} blog categories`);

  const author = await BlogAuthor.findOneAndUpdate(
    { name: 'TechClues team' },
    { $setOnInsert: { name: 'TechClues team', role: 'Editorial' } },
    { upsert: true, new: true },
  );
  console.log(`Ensured author "${author.name}" (${author._id})`);

  // --- Blog: posts ---
  let postsWritten = 0;
  for (const post of BLOG_POSTS) {
    await BlogPost.updateOne(
      { slug: post.slug },
      {
        $set: {
          title: post.title,
          category: post.category,
          authorId: String(author._id),
          excerpt: post.excerpt,
          cover: post.cover,
          coverAlt: post.coverAlt,
          body: post.body,
          status: 'published',
          publishedAt: post.publishedAt,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
        },
        $setOnInsert: { slug: post.slug },
      },
      { upsert: true },
    );
    postsWritten += 1;
  }
  console.log(`Upserted ${postsWritten} blog posts`);

  // --- Case studies ---
  let caseStudiesWritten = 0;
  for (const cs of [...CASE_STUDIES, ...CASE_STUDIES_2]) {
    await CaseStudy.updateOne(
      { slug: cs.slug },
      {
        $set: {
          title: cs.title,
          client: cs.client,
          industry: cs.industry,
          services: cs.services,
          excerpt: cs.excerpt,
          body: cs.body,
          cover: cs.cover,
          coverAlt: cs.coverAlt,
          images: cs.images ?? [],
          results: cs.results,
          testimonial: cs.testimonial,
          status: 'published',
          featured: cs.featured,
          publishedAt: new Date(),
          seoTitle: cs.seoTitle,
          seoDescription: cs.seoDescription,
        },
        $setOnInsert: { slug: cs.slug },
      },
      { upsert: true },
    );
    caseStudiesWritten += 1;
  }
  console.log(`Upserted ${caseStudiesWritten} case studies`);

  // --- Footer links: ports the footer's current hardcoded columns so the public footer renders
  // identically before anyone edits anything from the admin panel. Skipped if links already exist
  // (an admin may have already customised them) unless --force is passed. ---
  const existingLinks = await FooterLink.countDocuments();
  if (existingLinks > 0 && !process.argv.includes('--force')) {
    console.log(
      `FooterLink collection already has ${existingLinks} document(s) — skipping. Pass --force to reset.`,
    );
  } else {
    if (existingLinks > 0) {
      await FooterLink.deleteMany({});
      console.log(`Cleared ${existingLinks} existing footer link(s).`);
    }
    const FOOTER_DEFAULTS: { group: string; label: string; href: string }[] = [
      // Services
      { group: 'services', label: 'MVPs & Custom Platforms', href: '/services/mvp-development' },
      {
        group: 'services',
        label: 'Prototype to Production',
        href: '/services/prototype-to-production',
      },
      { group: 'services', label: 'AI Integration & Automation', href: '/services/ai-enablement' },
      { group: 'services', label: 'Web & Mobile Apps', href: '/services/web-mobile-apps' },
      { group: 'services', label: 'UI/UX & Prototyping', href: '/services/ui-ux-design' },
      { group: 'services', label: 'Low-Code / No-Code', href: '/services/low-code-no-code' },
      { group: 'services', label: 'Staff Augmentation', href: '/services/staff-augmentation' },
      { group: 'services', label: 'Game Development', href: '/services/game-development' },
      {
        group: 'services',
        label: 'E-commerce & Marketplaces',
        href: '/services/ecommerce-marketplace-development',
      },
      {
        group: 'services',
        label: 'Performance Marketing',
        href: '/services/performance-marketing',
      },
      { group: 'services', label: 'Strategy & Brand Identity', href: '/services/brand-strategy' },
      // Company
      { group: 'company', label: 'About us', href: '/about' },
      { group: 'company', label: 'Careers', href: '/careers' },
      { group: 'company', label: 'How we work', href: '/how-we-work' },
      { group: 'company', label: 'Case studies', href: '/case-studies' },
      { group: 'company', label: 'FAQ', href: '/faq' },
      { group: 'company', label: 'Blog', href: '/blog' },
      { group: 'company', label: 'MVP cost calculator', href: '/mvp-cost-calculator' },
      { group: 'company', label: 'Kill my idea', href: '/kill-my-idea' },
      { group: 'company', label: 'BUILD.ONE', href: '/zero-one' },
      { group: 'company', label: 'Grant support', href: '/grant-funding' },
      { group: 'company', label: 'Partner programme', href: '/partners' },
      // Sectors
      { group: 'sectors', label: 'Healthcare & medical', href: '/industries/healthcare-medical' },
      {
        group: 'sectors',
        label: 'Logistics & transportation',
        href: '/industries/logistics-transportation',
      },
      { group: 'sectors', label: 'Retail & e-commerce', href: '/industries/retail-ecommerce' },
      {
        group: 'sectors',
        label: 'Education & consulting',
        href: '/industries/education-consulting',
      },
      {
        group: 'sectors',
        label: 'Pre-seed & seed startups',
        href: '/industries/pre-seed-seed-startups',
      },
      {
        group: 'sectors',
        label: 'Recruitment & staffing',
        href: '/industries/recruitment-staffing',
      },
      { group: 'sectors', label: 'SaaS startups', href: '/industries/saas-startups' },
      {
        group: 'sectors',
        label: 'Industry & manufacturing',
        href: '/industries/industry-manufacturing',
      },
      // Legal (bottom strip)
      { group: 'legal', label: 'Privacy policy', href: '/privacy-policy' },
      { group: 'legal', label: 'Terms & conditions', href: '/terms-conditions' },
    ];
    const docs = FOOTER_DEFAULTS.map((link) => ({
      ...link,
      order: FOOTER_DEFAULTS.filter((l) => l.group === link.group).indexOf(link),
      newTab: false,
      published: true,
    }));
    await FooterLink.insertMany(docs);
    console.log(
      `Inserted ${docs.length} footer links across ${new Set(docs.map((d) => d.group)).size} groups`,
    );
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
