export interface SeedService {
  slug: string;
  cardTitle: string;
  cardDescription: string;
  features: string[];
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheading: string;
}

// Ported verbatim from the existing hardcoded markup (ServicesMarkup.tsx + each service's own
// Markup component) so switching the pages over to the API changes nothing visually until an
// admin actually edits something.
export const SERVICES: SeedService[] = [
  {
    slug: 'mvp-development',
    cardTitle: 'MVPs & Bespoke Platforms',
    cardDescription: 'Our core service: we test your idea, create a lean MVP, then scale it into a full platform.',
    features: ['Idea validation', 'Roadmap & MVP scoping', 'Full-stack engineering'],
    heroEyebrow: 'UK startup MVP development',
    heroHeadline: 'Shape your idea into something people genuinely want.',
    heroSubheading: 'Our core service: we test your idea, create a lean MVP, then scale it into a full platform.',
  },
  {
    slug: 'web-mobile-apps',
    cardTitle: 'Web & Mobile Applications',
    cardDescription: 'Quick, dependable web and mobile apps, made with modern tech and built to perform from the start.',
    features: ['Web applications', 'iOS & Android applications', 'Integrations & APIs', 'Security & performance'],
    heroEyebrow: 'App development across Birmingham and the whole UK',
    heroHeadline: 'Apps for web and mobile that load fast and run everywhere.',
    heroSubheading: 'Quick, dependable web and mobile apps, made with modern tech and built to perform from the start.',
  },
  {
    slug: 'ai-enablement',
    cardTitle: 'Automation & AI Integration',
    cardDescription: 'We apply AI where it delivers returns: within the product you have today, or within a fresh one designed around it.',
    features: ['Audit with AI first', 'Choosing models & tools', 'Fitting into your systems', 'Monitoring & evaluation'],
    heroEyebrow: 'Services for AI integration',
    heroHeadline: 'AI worth its place inside your product.',
    heroSubheading: 'We apply AI where it delivers returns: within the product you have today, or within a fresh one designed around it.',
  },
  {
    slug: 'ui-ux-design',
    cardTitle: 'UI/UX & Prototype work',
    cardDescription: 'Interfaces that people grasp immediately, tested on real users before any code exists.',
    features: ['User research', 'User flows & wireframes', 'Design systems for UI', 'Clickable prototypes'],
    heroEyebrow: 'Prototyping and UI/UX design',
    heroHeadline: 'Design people grasp within seconds.',
    heroSubheading: 'Interfaces that people grasp immediately, tested on real users before any code exists.',
  },
  {
    slug: 'brand-strategy',
    cardTitle: 'Brand Identity & Strategy',
    cardDescription: 'Sharp positioning plus a brand identity that gives your product credibility at launch.',
    features: ['Competitor & market research', 'Messaging & positioning', 'Visual identity & logo', 'Brand rulebook'],
    heroEyebrow: 'Identity and brand strategy built for startups',
    heroHeadline: "A brand that earns people's trust from their very first click.",
    heroSubheading: 'Sharp positioning plus a brand identity that gives your product credibility at launch.',
  },
  {
    slug: 'performance-marketing',
    cardTitle: 'Performance Marketing',
    cardDescription: 'Campaigns led by data that win your first users, then support your growth after launch.',
    features: ['Launch campaigns & waitlists', 'Search & paid social', 'Optimising landing pages', 'Reporting & analytics'],
    heroEyebrow: 'Performance marketing aimed at startups',
    heroHeadline: 'Land your first users and keep new ones arriving.',
    heroSubheading: 'Campaigns led by data that win your first users, then support your growth after launch.',
  },
  {
    slug: 'ecommerce-marketplace-development',
    cardTitle: 'Marketplaces & E-commerce',
    cardDescription: 'Online shops and multi-vendor marketplaces designed to turn browsers into buyers, simple for your team to operate.',
    features: ['Shopify, WooCommerce or bespoke', 'Tax, shipping and payments', 'Multi-vendor marketplaces', 'Analytics and integrations'],
    heroEyebrow: 'Marketplace and e-commerce development',
    heroHeadline: "A web store or marketplace that's effortless to buy from and to manage.",
    heroSubheading: 'Online shops and multi-vendor marketplaces designed to turn browsers into buyers, simple for your team to operate.',
  },
  {
    slug: 'low-code-no-code',
    cardTitle: 'No-Code / Low-Code',
    cardDescription: 'When speed matters above all, we ship working products using trusted low-code platforms.',
    features: ['Platform selection', 'Rapid build', 'Workflows & automations', 'Training & handover'],
    heroEyebrow: 'Low-code and no-code development',
    heroHeadline: 'A usable product within days, rather than months.',
    heroSubheading: 'When speed matters above all, we ship working products using trusted low-code platforms.',
  },
  {
    slug: 'prototype-to-production',
    cardTitle: 'Prototype into Production',
    cardDescription: 'Used AI to build it? We tighten security, steady performance and prepare it for real users, with no restart.',
    features: ['Audit of code & security', 'Sprint for hardening', 'Integrations & payments', 'Go-live & monitoring'],
    heroEyebrow: "Taking UK founders' AI-built apps into production",
    heroHeadline: 'Real users can rely on your AI-built app.',
    heroSubheading: 'Used AI to build it? We tighten security, steady performance and prepare it for real users, with no restart.',
  },
  {
    slug: 'staff-augmentation',
    cardTitle: 'Staff Augmentation',
    cardDescription: 'We place vetted engineers and AI specialists within your team immediately, so you retain the roadmap, codebase and IP throughout.',
    features: ['Engineers plus AI specialists', 'Onshore, nearshore or offshore', 'Approved by you after vetting', 'Flex your capacity up or down'],
    heroEyebrow: 'Staff augmentation',
    heroHeadline: 'Our engineers and AI team, inside yours.',
    heroSubheading: 'From the first day, vetted engineers and AI specialists sit within your team, so architectural choices and lessons from production stay in your organisation.',
  },
  {
    slug: 'game-development',
    cardTitle: 'Game Creation',
    cardDescription: 'UEFN, the metaverse, Unity, Unreal, VR and XR: complete game development that goes from first concept right through to launch and live ops.',
    features: ['Art and asset production', 'Unity and Unreal development', 'Web3, multiplayer and AR, VR, XR', 'Live ops and launch'],
    heroEyebrow: 'Game creation',
    heroHeadline: 'Game builds that launch and scale well.',
    heroSubheading: 'Tap limitless possibilities through professional-grade game production, whether in Unreal Engine, Unity, UEFN, VR and XR or the metaverse, covering everything from initial concept to release and live ops.',
  },
];
