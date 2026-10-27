import { SeoEntry } from '../../database/schemas/seo-entry.schema';

export interface SeoScoreResult {
  score: number;
  checks: { label: string; pass: boolean }[];
}

/** A lightweight, deterministic completeness score — not a crawler-based audit, just a checklist
 *  of the fields that matter most for how a page is represented in search and social previews. */
export function scoreSeoEntry(entry: Pick<SeoEntry, 'title' | 'description' | 'canonical' | 'ogImage' | 'schemaType' | 'noindex'>): SeoScoreResult {
  const titleLen = entry.title?.trim().length ?? 0;
  const descLen = entry.description?.trim().length ?? 0;

  const checks = [
    { label: 'Title set', pass: titleLen > 0 },
    { label: 'Title length (30–60 chars)', pass: titleLen >= 30 && titleLen <= 60 },
    { label: 'Description set', pass: descLen > 0 },
    { label: 'Description length (120–160 chars)', pass: descLen >= 120 && descLen <= 160 },
    { label: 'Canonical URL set', pass: !!entry.canonical?.trim() },
    { label: 'Social share image set', pass: !!entry.ogImage?.trim() },
    { label: 'Structured data selected', pass: entry.schemaType !== 'none' },
    { label: 'Indexable (unless intentionally noindex)', pass: true },
  ];
  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
  return { score, checks };
}
