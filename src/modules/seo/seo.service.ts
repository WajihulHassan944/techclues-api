import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SeoEntry } from '../../database/schemas/seo-entry.schema';
import { Redirect } from '../../database/schemas/redirect.schema';
import { NotFoundHit } from '../../database/schemas/not-found-hit.schema';
import { Backlink } from '../../database/schemas/backlink.schema';
import { BlogPost } from '../../database/schemas/blog.schema';
import { CaseStudy } from '../../database/schemas/case-study.schema';
import { ActivityService } from '../activity/activity.service';
import { STATIC_ROUTES } from '../../common/constants/static-routes';
import { scoreSeoEntry } from './seo-score';
import { CreateBacklinkDto, UpdateBacklinkDto } from './dto/backlink.dto';

const SITE_URL = process.env.SITE_URL || 'https://techclues.co.uk';

@Injectable()
export class SeoService {
  constructor(
    @InjectModel(SeoEntry.name) private readonly seoModel: Model<SeoEntry>,
    @InjectModel(Redirect.name) private readonly redirectModel: Model<Redirect>,
    @InjectModel(NotFoundHit.name) private readonly notFoundModel: Model<NotFoundHit>,
    @InjectModel(Backlink.name) private readonly backlinkModel: Model<Backlink>,
    @InjectModel(BlogPost.name) private readonly blogModel: Model<BlogPost>,
    @InjectModel(CaseStudy.name) private readonly caseStudyModel: Model<CaseStudy>,
    private readonly activity: ActivityService,
  ) {}

  // --- Pages ---

  async listPages() {
    const entries = await this.seoModel.find().lean();
    const byPath = new Map(entries.map((e) => [e.path, e]));
    const [blogSlugs, caseStudySlugs] = await Promise.all([
      this.blogModel.find({ status: 'published' }).select('slug title').lean(),
      this.caseStudyModel.find({ status: 'published' }).select('slug title').lean(),
    ]);
    const known = [
      ...STATIC_ROUTES,
      ...blogSlugs.map((b) => ({ path: `/blog/${b.slug}`, label: b.title })),
      ...caseStudySlugs.map((c) => ({ path: `/case-studies/${c.slug}`, label: c.title })),
    ];
    return known.map(({ path, label }) => {
      const entry = byPath.get(path);
      const { score } = scoreSeoEntry(
        entry ?? { title: '', description: '', canonical: '', ogImage: '', schemaType: 'none', noindex: false },
      );
      return {
        path,
        label,
        hasEntry: !!entry,
        title: entry?.title ?? '',
        description: entry?.description ?? '',
        noindex: entry?.noindex ?? false,
        schemaType: entry?.schemaType ?? 'none',
        score,
      };
    });
  }

  async getPage(path: string) {
    const entry = await this.seoModel.findOne({ path }).lean();
    const score = scoreSeoEntry(
      entry ?? { title: '', description: '', canonical: '', ogImage: '', schemaType: 'none', noindex: false },
    );
    return { entry, ...score };
  }

  async upsertPage(dto: { path: string } & Partial<SeoEntry>) {
    const { path, ...patch } = dto;
    const entry = await this.seoModel.findOneAndUpdate(
      { path },
      { $set: patch, $setOnInsert: { path } },
      { upsert: true, new: true },
    );
    await this.activity.log('seo', `Updated SEO fields for ${path}`);
    return entry;
  }

  async deletePage(path: string) {
    await this.seoModel.deleteOne({ path });
    await this.activity.log('seo', `Reset SEO fields for ${path}`);
    return { ok: true };
  }

  /** What a page's generateMetadata() should use — null means "use the frontend's own defaults". */
  async getPublicPage(path: string) {
    return this.seoModel.findOne({ path }).lean();
  }

  // --- Redirects ---

  async listRedirects() {
    return this.redirectModel.find().sort({ from: 1 }).lean();
  }

  async createRedirect(input: { from: string; to: string; statusCode?: 301 | 302 }) {
    const redirect = await this.redirectModel.create({
      from: input.from,
      to: input.to,
      statusCode: input.statusCode ?? 301,
    });
    await this.activity.log('seo', `Added a redirect: ${input.from} → ${input.to}`);
    return redirect;
  }

  async updateRedirect(id: string, patch: { to?: string; statusCode?: 301 | 302 }) {
    const redirect = await this.redirectModel.findById(id);
    if (!redirect) throw new NotFoundException('Redirect not found');
    Object.assign(redirect, patch);
    await redirect.save();
    await this.activity.log('seo', `Updated the redirect from ${redirect.from}`);
    return redirect;
  }

  async deleteRedirect(id: string) {
    const redirect = await this.redirectModel.findById(id);
    if (!redirect) throw new NotFoundException('Redirect not found');
    await redirect.deleteOne();
    await this.activity.log('seo', `Deleted the redirect from ${redirect.from}`);
    return { ok: true };
  }

  async listPublicRedirects() {
    return this.redirectModel.find().select('from to statusCode').lean();
  }

  async resolveRedirect(from: string) {
    const redirect = await this.redirectModel.findOneAndUpdate({ from }, { $inc: { hits: 1 } });
    return redirect ? { to: redirect.to, statusCode: redirect.statusCode } : null;
  }

  // --- 404 tracking ---

  async report404(path: string, referrer?: string) {
    await this.notFoundModel.findOneAndUpdate(
      { path },
      { $inc: { hits: 1 }, $set: { lastReferrer: referrer, lastSeenAt: new Date(), resolved: false } },
      { upsert: true },
    );
  }

  async list404s() {
    return this.notFoundModel.find({ resolved: false }).sort({ hits: -1, lastSeenAt: -1 }).lean();
  }

  async resolve404(id: string) {
    await this.notFoundModel.updateOne({ _id: id }, { $set: { resolved: true } });
    return { ok: true };
  }

  // --- Sitemap & robots ---

  async buildSitemap() {
    const [entries, blogSlugs, caseStudySlugs] = await Promise.all([
      this.seoModel.find({ includeInSitemap: true, noindex: false }).select('path').lean(),
      this.blogModel.find({ status: 'published' }).select('slug updatedAt').lean(),
      this.caseStudyModel.find({ status: 'published' }).select('slug updatedAt').lean(),
    ]);
    const noindexPaths = new Set(
      (await this.seoModel.find({ noindex: true }).select('path').lean()).map((e) => e.path),
    );
    const extraPaths = new Set(entries.map((e) => e.path));
    const urls: { loc: string; lastmod?: string }[] = [];
    for (const r of STATIC_ROUTES) {
      if (!noindexPaths.has(r.path)) urls.push({ loc: r.path });
    }
    for (const b of blogSlugs) {
      const path = `/blog/${b.slug}`;
      if (!noindexPaths.has(path)) urls.push({ loc: path, lastmod: (b as { updatedAt?: Date }).updatedAt?.toISOString() });
    }
    for (const c of caseStudySlugs) {
      const path = `/case-studies/${c.slug}`;
      if (!noindexPaths.has(path)) urls.push({ loc: path, lastmod: (c as { updatedAt?: Date }).updatedAt?.toISOString() });
    }
    const known = new Set(urls.map((u) => u.loc));
    for (const p of extraPaths) {
      if (!known.has(p) && !noindexPaths.has(p)) urls.push({ loc: p });
    }

    const body = urls
      .map(
        (u) =>
          `  <url><loc>${SITE_URL}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
      )
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
  }

  async buildRobotsTxt() {
    const noindexPaths = await this.seoModel.find({ noindex: true }).select('path').lean();
    const lines = ['User-agent: *'];
    for (const e of noindexPaths) lines.push(`Disallow: ${e.path}`);
    lines.push('Disallow: /admin');
    lines.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
    return lines.join('\n');
  }

  // --- Backlinks ---

  async listBacklinks() {
    return this.backlinkModel.find().sort({ createdAt: -1 }).lean();
  }

  async backlinkStats() {
    const [total, live, referringDomains] = await Promise.all([
      this.backlinkModel.countDocuments(),
      this.backlinkModel.countDocuments({ status: 'live' }),
      this.backlinkModel.distinct('sourceUrl').then((urls) => {
        const domains = new Set(
          urls.map((u) => {
            try {
              return new URL(u.startsWith('http') ? u : `https://${u}`).hostname.replace(/^www\./, '');
            } catch {
              return u;
            }
          }),
        );
        return domains.size;
      }),
    ]);
    return { total, live, referringDomains };
  }

  async createBacklink(dto: CreateBacklinkDto) {
    const link = await this.backlinkModel.create(dto);
    await this.activity.log('seo', `Added a backlink from ${dto.sourceUrl}`);
    return link;
  }

  async updateBacklink(id: string, dto: UpdateBacklinkDto) {
    const link = await this.backlinkModel.findById(id);
    if (!link) throw new NotFoundException('Backlink not found');
    Object.assign(link, dto);
    if (dto.status) link.lastCheckedAt = new Date();
    await link.save();
    await this.activity.log('seo', `Updated the backlink from ${link.sourceUrl}`);
    return link;
  }

  async deleteBacklink(id: string) {
    const link = await this.backlinkModel.findById(id);
    if (!link) throw new NotFoundException('Backlink not found');
    await link.deleteOne();
    await this.activity.log('seo', `Deleted the backlink from ${link.sourceUrl}`);
    return { ok: true };
  }
}
