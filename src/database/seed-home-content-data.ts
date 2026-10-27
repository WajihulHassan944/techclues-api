// Ported verbatim from the current hardcoded homepage markup, keyed by the field names the admin
// editor and HomeMarkup.tsx both use. Labels describe each field for the admin UI.
export const HOME_CONTENT: Record<string, { label: string; value: string }> = {
  'hero.eyebrow': { label: 'Hero — small label above the headline', value: 'MVP development firm in Birmingham' },
  'hero.line1': { label: 'Hero — first headline line', value: 'Ready-to-launch MVPs.' },
  'section1.heading': { label: 'Intro section — heading', value: 'Ideas begin with us.' },
  'section1.body': {
    label: 'Intro section — body',
    value:
      'TechClues is an MVP studio guiding founders from raw ideas to products that people genuinely want. Testing comes ahead of building, which means every pound you spend moves you closer to product-market fit.',
  },
  'section2.heading': { label: 'What we cover — heading', value: 'All that your product requires.' },
  'section3.heading': { label: 'AI section — heading', value: 'AI embedded in your existing systems.' },
  'section4.heading': { label: 'Case studies teaser — heading', value: 'Ideas that became real products.' },
  'section5.heading': { label: 'Process — heading', value: 'Idea to launch across eight phases.' },
  'section5.body': {
    label: 'Process — body',
    value: 'A process that puts validation first, with clear milestones and genuine user feedback throughout.',
  },
  'section6.heading': { label: 'Stats — heading', value: 'Just what counts.' },
  'section7.heading': { label: 'FAQ — heading', value: 'Your questions, answered.' },
  'section7.body': {
    label: 'FAQ — body',
    value: 'Not finding your answer? Send us a message and we reply within hours.',
  },
  'section8.heading': { label: 'Blog teaser — heading', value: 'Thoughts on building better.' },
  'section9.heading': { label: 'CTA — heading', value: 'Have an idea that deserves testing?' },
  'section9.body': {
    label: 'CTA — body',
    value: 'Book a free 30-minute call. We will tell you plainly if the idea deserves building, and what that would take.',
  },
};
