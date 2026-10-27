// Ported verbatim from the current hardcoded homepage markup, keyed by the field names the admin
// editor and HomeMarkup.tsx both use. Keys must never contain a "." — Mongo's dot-path update
// syntax treats a dot as nesting, not a literal character in a Map key.
export const HOME_CONTENT: Record<string, { label: string; value: string }> = {
  heroEyebrow: { label: 'Hero — small label above the headline', value: 'MVP development firm in Birmingham' },
  heroLine1: { label: 'Hero — first headline line', value: 'Ready-to-launch MVPs.' },
  section1Heading: { label: 'Intro section — heading', value: 'Ideas begin with us.' },
  section1Body: {
    label: 'Intro section — body',
    value:
      'TechClues is an MVP studio guiding founders from raw ideas to products that people genuinely want. Testing comes ahead of building, which means every pound is spent where it counts.',
  },
  section2Heading: { label: 'What we cover — heading', value: 'All that your product requires.' },
  section3Heading: { label: 'AI section — heading', value: 'AI embedded in your existing systems.' },
  section4Heading: { label: 'Case studies teaser — heading', value: 'Ideas that became real products.' },
  section5Heading: { label: 'Process — heading', value: 'Idea to launch across eight phases.' },
  section5Body: {
    label: 'Process — body',
    value: 'A process that puts validation first, with clear milestones and genuine user feedback throughout.',
  },
  section6Heading: { label: 'Stats — heading', value: 'Just what counts.' },
  section7Heading: { label: 'FAQ — heading', value: 'Your questions, answered.' },
  section7Body: {
    label: 'FAQ — body',
    value: 'Not finding your answer? Send us a message and we reply within hours.',
  },
  section8Heading: { label: 'Blog teaser — heading', value: 'Thoughts on building better.' },
  section9Heading: { label: 'CTA — heading', value: 'Have an idea that deserves testing?' },
  section9Body: {
    label: 'CTA — body',
    value: 'Book a free 30-minute call. We will tell you plainly if the idea deserves building, and what that would take.',
  },
};
