/** Default MVP cost calculator pricing model — mirrors the frontend's lib/calculator.ts so a
 *  freshly-created Settings row produces identical quotes to the old hardcoded version. Once an
 *  admin edits it via /admin/settings these defaults no longer apply to that installation. */
export const DEFAULT_CALCULATOR_PRICING = {
  goals: [
    {
      id: 'mvp',
      name: 'Start with an MVP',
      text: 'Try the idea out on real users first.',
      multiplier: 1,
    },
    {
      id: 'full',
      name: 'Build a full product',
      text: 'A finished platform, built to grow.',
      multiplier: 1.5,
    },
    {
      id: 'update',
      name: 'Update a product',
      text: 'Improve or expand what you already have.',
      multiplier: 0.7,
    },
  ],
  platforms: [
    { id: 'web', name: 'Web app', text: 'Runs in any browser.', multiplier: 0.5 },
    { id: 'mobile', name: 'Mobile app', text: 'iOS and Android.', multiplier: 1.2 },
    { id: 'both', name: 'Web + mobile', text: 'All screens, a single product.', multiplier: 1.7 },
  ],
  features: [
    { id: 'auth', name: 'Sign up & log in', baseCost: 600, weeks: 1 },
    { id: 'onboarding', name: 'User onboarding', baseCost: 450, weeks: 1 },
    { id: 'payments', name: 'Payments', baseCost: 700, weeks: 1 },
    { id: 'subscriptions', name: 'Subscriptions', baseCost: 800, weeks: 1 },
    { id: 'notifications', name: 'Notifications', baseCost: 450, weeks: 1 },
    { id: 'chat', name: 'Real-time chat', baseCost: 1000, weeks: 1 },
    { id: 'search', name: 'Search & filters', baseCost: 550, weeks: 1 },
    { id: 'uploads', name: 'File & media uploads', baseCost: 500, weeks: 1 },
    { id: 'booking', name: 'Booking & scheduling', baseCost: 850, weeks: 1 },
    { id: 'maps', name: 'Maps & location', baseCost: 600, weeks: 1 },
    { id: 'reviews', name: 'Reviews & ratings', baseCost: 450, weeks: 1 },
    { id: 'analytics', name: 'Analytics', baseCost: 800, weeks: 1 },
    { id: 'dashboard', name: 'Dashboards & reports', baseCost: 900, weeks: 1 },
    { id: 'ai', name: 'AI features', baseCost: 1600, weeks: 1 },
    { id: 'admin', name: 'Admin panel', baseCost: 900, weeks: 1 },
    { id: 'roles', name: 'Roles & permissions', baseCost: 550, weeks: 1 },
    { id: 'cms', name: 'Content management', baseCost: 650, weeks: 1 },
    { id: 'integrations', name: 'API integrations', baseCost: 700, weeks: 1 },
  ],
  paces: [
    { id: 'relaxed', name: 'Relaxed', text: '2–3 months', multiplier: 0.6 },
    { id: 'standard', name: 'Standard', text: '1–2 months', multiplier: 0.7 },
    { id: 'fast', name: 'Fast track', text: '2–4 weeks', multiplier: 0.9 },
  ],
  setupFee: 2500,
  floors: { mvp: 5000, full: 10000, update: 0 },
};

export const DEFAULT_BUILD_ONE_PRICE = { amount: 499, durationLabel: '7 days' };
