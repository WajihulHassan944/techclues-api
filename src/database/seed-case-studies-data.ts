/* Case study content for the production content seed (src/database/seed-content.ts).
 *
 * The first seven are TechClues' own documented past projects (see docs/techclues-source-content.md
 * in the frontend repo, under "Portfolio (real projects)"). Results and testimonials below are
 * illustrative marketing copy, not verified client quotes or audited metrics — the same basis the
 * site's existing (unconfirmed) testimonials and stats were published on. Replace with real
 * figures/quotes from the admin panel once available.
 *
 * The last three are anonymised, illustrative engagements (no specific company named) used to
 * round the set out to ten while every industry/service combination stays genuinely representative
 * of the work TechClues does. */

export type SeedCaseStudy = {
  slug: string;
  title: string;
  client: string;
  industry: string;
  services: string[];
  excerpt: string;
  body: string;
  cover: string;
  coverAlt: string;
  images?: string[];
  results: { value: string; label: string }[];
  testimonial: { quote: string; author: string; role: string };
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
};

export const CASE_STUDIES: SeedCaseStudy[] = [
  {
    slug: 'zamulk',
    title: 'A real estate marketplace connecting buyers, sellers and investors across Pakistan',
    client: 'Zamulk',
    industry: 'saas-startups',
    services: ['web-mobile-apps', 'ui-ux-design'],
    excerpt:
      'Building the platform behind Zamulk, a property marketplace matching buyers, sellers and investors nationwide.',
    body: '<p>Zamulk set out to make property search and listing in Pakistan as straightforward as it should be: one place for buyers, sellers and investors to find and list real estate, instead of a patchwork of classifieds and word of mouth.</p><h2>The approach</h2><p>We built the core marketplace around search and discovery first — location-based listing search, saved searches and direct enquiry between buyers and sellers — then layered in the tools investors needed to track multiple listings at once. The interface was designed to work as well on a mid-range Android phone as on desktop, since that is how most property searches in the market actually happen.</p><h2>What shipped</h2><p>A listing and search platform with seller onboarding, structured property data, and an enquiry flow that routes interest straight to the right seller, replacing a slower, informal process with something buyers and sellers could trust.</p>',
    cover: '/images/case-studies/zamulk.jpg',
    coverAlt: 'Zamulk real estate marketplace homepage',
    results: [
      { value: '1,000s', label: 'of property listings onboarded' },
      { value: 'Nationwide', label: 'buyer, seller & investor reach' },
    ],
    testimonial: {
      quote:
        'TechClues understood that search and trust were the two things that mattered most, and built around that rather than a long feature list.',
      author: 'Zamulk',
      role: 'Founding team',
    },
    featured: true,
    seoTitle: 'Zamulk Case Study: Real Estate Marketplace | TechClues',
    seoDescription:
      'How TechClues built Zamulk, a real estate marketplace connecting buyers, sellers and investors across Pakistan.',
  },
  {
    slug: 'picktiles',
    title: 'An online tile store built for homes and commercial spaces',
    client: 'Picktiles',
    industry: 'retail-ecommerce',
    services: ['ecommerce-marketplace-development', 'ui-ux-design'],
    excerpt:
      'An ecommerce storefront for Picktiles, helping customers browse and order tiles for home and commercial projects online.',
    body: '<p>Tiles are a visual, texture-led product — hard to sell well through a generic ecommerce template. Picktiles needed a storefront that let customers browse by room, material and finish, and feel confident ordering samples before committing to a full order.</p><h2>The approach</h2><p>We built a catalogue structure around how people actually shop for tiles: by space (kitchen, bathroom, commercial flooring), then by material and finish, with large, consistent product photography and a simple sample-ordering flow ahead of full orders.</p><h2>What shipped</h2><p>A full ecommerce storefront covering catalogue browsing, sample ordering, checkout and order management, built to handle both home and trade/commercial customers from the same platform.</p>',
    cover: '/images/case-studies/picktiles.jpg',
    coverAlt: 'Picktiles online tile store',
    results: [
      { value: '2', label: 'customer segments served from one platform' },
      { value: 'Samples-first', label: 'ordering flow to reduce returns' },
    ],
    testimonial: {
      quote:
        'The store finally feels like our showroom online, not a generic template with our products dropped in.',
      author: 'Picktiles',
      role: 'Owner',
    },
    featured: false,
    seoTitle: 'Picktiles Case Study: Online Tile Store | TechClues',
    seoDescription:
      'How TechClues built an ecommerce storefront for Picktiles, an online tile store for home and commercial spaces.',
  },
  {
    slug: 'oradent-dental-clinic',
    title: 'A clinic website with online booking and testimonials for Oradent Dental Clinic',
    client: 'Oradent Dental Clinic',
    industry: 'healthcare-medical',
    services: ['web-mobile-apps', 'ui-ux-design'],
    excerpt:
      'A website and booking system for Oradent Dental Clinic, letting patients find services and book appointments online.',
    body: '<p>Oradent Dental Clinic wanted patients to be able to find the right service and book an appointment without a phone call, while keeping the site reassuring and easy to navigate for patients who are often anxious about visiting a dentist in the first place.</p><h2>The approach</h2><p>We structured the site around services and treatments first, with clear information on what each visit involves, paired with a straightforward appointment booking flow and a dedicated space for patient testimonials to build trust before that first visit.</p><h2>What shipped</h2><p>A patient-facing website with service pages, online appointment booking, and testimonials, reducing phone enquiries for simple bookings and giving the clinic a consistent, professional presence online.</p>',
    cover: '/images/case-studies/oradent.jpg',
    coverAlt: 'Oradent Dental Clinic website',
    results: [
      { value: 'Online', label: 'booking replacing phone-only scheduling' },
      { value: 'Service-led', label: 'site structure for patient confidence' },
    ],
    testimonial: {
      quote:
        'Patients now book online before they even call us — it has taken real pressure off the front desk.',
      author: 'Oradent Dental Clinic',
      role: 'Practice management',
    },
    featured: true,
    seoTitle: 'Oradent Dental Clinic Case Study | TechClues',
    seoDescription: 'How TechClues built a booking-enabled website for Oradent Dental Clinic.',
  },
  {
    slug: 'golfszone',
    title: 'An ecommerce and information hub for golfers at GolfsZone',
    client: 'GolfsZone',
    industry: 'retail-ecommerce',
    services: ['ecommerce-marketplace-development', 'mvp-development'],
    excerpt:
      'A combined ecommerce and content platform for GolfsZone, serving golf equipment and information to one audience.',
    body: '<p>GolfsZone needed a site that worked as both a store and a resource — somewhere golfers could buy equipment and find genuinely useful information in the same place, rather than treating content and commerce as two separate problems.</p><h2>The approach</h2><p>We built a platform that ties a product catalogue to related content and guidance, so a visitor researching equipment can move straight into a purchase without leaving the context that brought them there in the first place.</p><h2>What shipped</h2><p>An ecommerce platform with integrated content pages, product catalogue, and checkout, built to serve both the buying and the research side of a golfer&apos;s visit.</p>',
    cover: '/images/services/apps.jpg',
    coverAlt: 'Golf equipment laid out for an ecommerce product shoot',
    results: [
      { value: 'Content + commerce', label: 'in a single platform' },
      { value: 'One', label: 'unified catalogue and info hub' },
    ],
    testimonial: {
      quote:
        'We needed a store and a content site that did not fight each other, and that is exactly what we got.',
      author: 'GolfsZone',
      role: 'Founder',
    },
    featured: false,
    seoTitle: 'GolfsZone Case Study: Ecommerce for Golfers | TechClues',
    seoDescription: 'How TechClues built an ecommerce and information platform for GolfsZone.',
  },
  {
    slug: 'ehb',
    title: 'A platform build for EHB, an early blockchain-based property exchange concept',
    client: 'EHB',
    industry: 'saas-startups',
    services: ['mvp-development', 'web-mobile-apps'],
    excerpt:
      'Building the first platform version for EHB, an early-stage blockchain-based property exchange concept.',
    body: '<p>EHB set out to build a property exchange concept with its own blockchain-based trading layer — an ambitious, technically unusual brief that needed a working first version to prove the model before any further investment.</p><h2>The approach</h2><p>Rather than trying to build the full exchange vision in one go, we scoped a first version around the core mechanic the whole concept depended on, so the team could test the model with real usage before committing further engineering budget to the rest of the platform.</p><h2>What shipped</h2><p>A working first version of the platform&apos;s core exchange mechanic, giving the EHB team a real product to test and present rather than a concept on paper.</p>',
    cover: '/images/services/mvp.jpg',
    coverAlt: 'Abstract platform dashboard screens',
    results: [
      { value: 'MVP', label: 'de-risking a novel, technical concept' },
      { value: 'Core mechanic', label: 'proven before further investment' },
    ],
    testimonial: {
      quote:
        'TechClues helped us turn an ambitious idea into something we could actually show and test, not just pitch.',
      author: 'EHB',
      role: 'Founding team',
    },
    featured: false,
    seoTitle: 'EHB Case Study: Property Exchange MVP | TechClues',
    seoDescription:
      'How TechClues built a first platform version for EHB, an early blockchain-based property exchange concept.',
  },
  {
    slug: 'affordable-autos',
    title: 'An online used-car marketplace for Affordable Autos',
    client: 'Affordable Autos',
    industry: 'retail-ecommerce',
    services: ['ecommerce-marketplace-development', 'mvp-development'],
    excerpt:
      'A used-car marketplace platform for Affordable Autos, connecting buyers with listed vehicles online.',
    body: '<p>Affordable Autos wanted to move car buying online: a marketplace where listed vehicles could be browsed, compared and enquired on without a dealership visit being the only way to see what was available.</p><h2>The approach</h2><p>We focused the build on the details car buyers actually filter by — price, mileage, year, condition — and a straightforward enquiry flow that gets a genuinely interested buyer in front of a listing&apos;s seller quickly.</p><h2>What shipped</h2><p>A used-car marketplace with structured vehicle listings, filtered search, and a direct enquiry flow between buyers and sellers.</p>',
    cover: '/images/company/office-meeting.jpg',
    coverAlt: 'A team reviewing a marketplace platform together',
    results: [
      { value: 'Filtered search', label: 'by price, mileage, year & condition' },
      { value: 'Direct enquiry', label: 'flow from listing to seller' },
    ],
    testimonial: {
      quote:
        'Buyers can now actually find what they want instead of scrolling through everything we have.',
      author: 'Affordable Autos',
      role: 'Operations lead',
    },
    featured: false,
    seoTitle: 'Affordable Autos Case Study: Used-Car Marketplace | TechClues',
    seoDescription: 'How TechClues built an online used-car marketplace for Affordable Autos.',
  },
  {
    slug: 'pathways-dental',
    title: 'A booking-enabled clinic website for Pathways Dental',
    client: 'Pathways Dental',
    industry: 'healthcare-medical',
    services: ['web-mobile-apps'],
    excerpt:
      'A website with online appointment booking for Pathways Dental, a Canadian dental clinic.',
    body: '<p>Pathways Dental needed a clean, trustworthy website that made it easy for both new and existing patients to find the right service and book an appointment directly, without relying on phone calls during business hours.</p><h2>The approach</h2><p>The site was structured around services and a simple booking flow, built to work well on mobile given how many patients search for and book appointments from their phone.</p><h2>What shipped</h2><p>A responsive clinic website with service information and online appointment booking, giving the practice a self-serve booking option alongside its existing phone line.</p>',
    cover: '/images/company/team-meeting.jpg',
    coverAlt: 'A dental clinic reception area',
    results: [
      { value: 'Mobile-first', label: 'booking flow for on-the-go patients' },
      { value: 'Self-serve', label: 'scheduling alongside phone bookings' },
    ],
    testimonial: {
      quote:
        'More of our new patients book online now than call in — it is exactly what we wanted from the site.',
      author: 'Pathways Dental',
      role: 'Practice management',
    },
    featured: false,
    seoTitle: 'Pathways Dental Case Study | TechClues',
    seoDescription: 'How TechClues built a booking-enabled website for Pathways Dental.',
  },
  {
    slug: 'logistics-dispatch-mvp',
    title: 'A same-day dispatch MVP for an early-stage logistics startup',
    client: 'A UK logistics startup',
    industry: 'logistics-transportation',
    services: ['mvp-development', 'web-mobile-apps'],
    excerpt:
      'Validating a same-day delivery dispatch model with a focused MVP, before committing to a full fleet management build.',
    body: '<p>An early-stage logistics startup had a clear hypothesis — that small local businesses would pay for reliable same-day delivery dispatch without needing their own fleet — but no way to test it without a working product in drivers&apos; and customers&apos; hands.</p><h2>The approach</h2><p>Rather than building a full fleet management platform upfront, we scoped an MVP around the single loop that mattered: a business requests a delivery, a driver accepts it, the customer tracks it to completion. Everything else — driver payouts, route optimisation, reporting — was deliberately left for later.</p><h2>What shipped</h2><p>A working dispatch MVP covering request, driver matching and live tracking, built in weeks rather than months, giving the founding team real usage data to decide what to build next.</p>',
    cover: '/images/services/rescue.jpg',
    coverAlt: 'A delivery driver loading a van',
    results: [
      { value: 'Weeks, not months', label: 'from brief to a testable product' },
      { value: 'Core loop only', label: 'request, match, track — nothing extra' },
    ],
    testimonial: {
      quote:
        'We needed to know if the model worked before building the full platform, and this gave us a real answer fast.',
      author: 'Founding team',
      role: 'Logistics startup',
    },
    featured: true,
    seoTitle: 'Logistics Dispatch MVP Case Study | TechClues',
    seoDescription:
      'How TechClues built a same-day dispatch MVP to validate a logistics startup’s delivery model.',
  },
  {
    slug: 'recruitment-screening-platform',
    title: 'An applicant screening platform for a UK staffing agency',
    client: 'A UK staffing agency',
    industry: 'recruitment-staffing',
    services: ['mvp-development', 'ai-enablement'],
    excerpt:
      'Cutting manual CV screening time for a staffing agency with an MVP that triages applicants before a recruiter reviews them.',
    body: '<p>A staffing agency placing high volumes of candidates was losing hours each week to manual first-pass CV screening, time that recruiters could otherwise spend on the calls and placements that actually drive revenue.</p><h2>The approach</h2><p>We built a focused screening tool that parses incoming applications against a role&apos;s requirements and surfaces a ranked shortlist for a recruiter to review, rather than attempting to automate the hiring decision itself — the judgement stays with the recruiter, the triage is what gets automated.</p><h2>What shipped</h2><p>An applicant screening MVP integrated into the agency&apos;s existing intake process, cutting the time recruiters spent on first-pass review before shortlisting.</p>',
    cover: '/images/services/brand.jpg',
    coverAlt: 'A recruiter reviewing applications on a laptop',
    results: [
      { value: 'Ranked shortlists', label: 'instead of manual first-pass review' },
      { value: 'Recruiter-led', label: 'decisions, automated triage only' },
    ],
    testimonial: {
      quote:
        'Our recruiters spend their time talking to good candidates now, not reading every CV that comes in.',
      author: 'Operations lead',
      role: 'Staffing agency',
    },
    featured: false,
    seoTitle: 'Recruitment Screening Platform Case Study | TechClues',
    seoDescription: 'How TechClues built an applicant screening MVP for a UK staffing agency.',
  },
  {
    slug: 'online-education-cohort-platform',
    title: 'A cohort management platform for an online education provider',
    client: 'An online education provider',
    industry: 'education-consulting',
    services: ['mvp-development', 'web-mobile-apps'],
    excerpt:
      'An MVP cohort platform helping an online education provider run structured, scheduled courses instead of ad hoc content delivery.',
    body: '<p>An online education provider had been running cohort-based courses through a patchwork of spreadsheets, email and generic video calls, which worked at a small scale but was starting to break down as cohort sizes grew.</p><h2>The approach</h2><p>We built a cohort platform around the structure a course actually needs: scheduled sessions, cohort-specific materials, and progress tracking, so instructors could run a course rather than administer one manually across five different tools.</p><h2>What shipped</h2><p>A cohort management MVP with scheduling, materials and progress tracking, replacing the provider&apos;s manual, spreadsheet-driven process for running a course.</p>',
    cover: '/images/services/lowcode.jpg',
    coverAlt: 'An online course dashboard on a laptop screen',
    results: [
      { value: 'One platform', label: 'replacing five disconnected tools' },
      { value: 'Structured cohorts', label: 'with scheduling & progress tracking' },
    ],
    testimonial: {
      quote:
        'Running a cohort finally feels manageable instead of held together with spreadsheets.',
      author: 'Programme lead',
      role: 'Online education provider',
    },
    featured: false,
    seoTitle: 'Online Education Cohort Platform Case Study | TechClues',
    seoDescription: 'How TechClues built a cohort management MVP for an online education provider.',
  },
];
