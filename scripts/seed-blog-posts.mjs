/**
 * One-time content migration: the four launch posts into `blog_posts`.
 *
 * They used to live in src/data/articles.ts and src/data/blog-catalog.ts, which
 * the database replaced. This carries their exact copy — body, excerpt, byline,
 * publish date and SEO fields — into the table so no published article is lost
 * when a new environment is brought up.
 *
 * Safe to run more than once: a slug already in the table is left alone.
 *
 *   node scripts/seed-blog-posts.mjs
 *
 * Once every environment has been seeded, this file can be deleted.
 */
import mysql from 'mysql2/promise';

const cfg = process.env.DB_HOST
  ? {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME ?? '',
      user: process.env.DB_USER ?? '',
      password: process.env.DB_PASS ?? '',
    }
  : { host: '127.0.0.1', port: 3306, database: 'valunxt_capital_admin', user: 'root', password: '' };

const POSTS = [
  {
    "slug": "how-high-net-worth-investors-build-wealth-through-real-estate",
    "title": "How High-Net-Worth Investors Build Wealth Through Real Estate",
    "category": "Real Estate Wealth",
    "excerpt": "For affluent investors, real estate is a disciplined, multi-decade strategy for compounding capital, generating income, and preserving wealth across cycles.",
    "body": "\n<p>For affluent investors, real estate functions as a disciplined, multi-decade strategy for compounding capital, generating income, and preserving wealth across cycles. The distinction between sustainable property wealth and speculative returns depends almost entirely on process discipline.</p>\n<h3>Wealth is built on allocation, not individual deals</h3>\n<p>Sophisticated investors treat real estate as one sleeve of a diversified portfolio, sized deliberately against equities, fixed income, and private assets. The question is never simply &#8220;is this a good building?&#8221; but &#8220;does this asset improve the risk-adjusted return of the whole portfolio?&#8221;</p>\n<p>That framing changes behaviour. It encourages patience, disciplined position sizing, and a willingness to say no &#8212; the habits that protect capital when a cycle turns.</p>\n<h3>The three engines of property wealth</h3>\n<p>Real estate compounds through three engines working together: recurring income from rent, capital appreciation over time, and prudent leverage that amplifies returns on equity. Managed well, they reinforce one another; managed carelessly, leverage turns a modest correction into a permanent loss.</p>\n<p>The most resilient investors optimise all three deliberately rather than chasing appreciation alone.</p>\n<h3>Downside protection is the real edge</h3>\n<p>Institutional-grade investors spend as much time on what could go wrong as on the upside. Conservative underwriting, stress-tested cash flows, sensible loan-to-value ratios, and staggered maturities are what allow a portfolio to survive &#8212; and buy &#8212; when markets dislocate.</p>\n<p>This is where independent research and intelligence earns its keep, replacing optimism with evidence.</p>\n<h3>A disciplined partner compounds the advantage</h3>\n<p>Building real estate wealth at scale is a team sport &#8212; combining strategy, valuation, capital structuring, and active asset management. Valunxt&#8217;s Real Estate Wealth Advisory practice helps investors design and manage portfolios built to compound across decades, not headlines.</p>\n",
    "cover_image": "/assets/content/uploads/blogs/blog-1.webp",
    "cover_alt": "How High-Net-Worth Investors Build Wealth Through Real Estate",
    "author": "Valunxt Research Team",
    "author_role": "Real Estate Wealth Advisory",
    "published_at": "2026-07-28",
    "meta_title": "How High-Net-Worth Investors Build Wealth Through Real Estate | Valunxt",
    "meta_description": "For affluent investors, real estate is a disciplined, multi-decade strategy for compounding capital, generating income, and preserving wealth across cycles.",
    "og_image": "/assets/content/uploads/blogs/blog-1.webp"
  },
  {
    "slug": "capital-planning-for-large-property-developments",
    "title": "Capital Planning for Large Property Developments",
    "category": "Capital Advisory",
    "excerpt": "Large developments rarely fail for lack of a good idea &#8212; they fail for lack of a capital plan mapped across the full lifecycle.",
    "body": "\n<p>Large developments rarely fail for lack of a good idea; they fail for lack of a capital plan. Effective capital planning maps funding needs across a project&#8217;s entire lifecycle to maintain schedule and financial stability.</p>\n<h3>A roadmap, not a snapshot</h3>\n<p>Capital planning maps how much capital is needed, when, and from where &#8212; across land, approvals, construction, and stabilisation. It turns a series of funding scrambles into a deliberate strategy.</p>\n<h3>Contingency and liquidity</h3>\n<p>Cost overruns and delays are the norm, not the exception. Building contingency and liquidity buffers into the plan is what prevents a temporary problem from becoming a terminal one.</p>\n<h3>Phasing to manage risk</h3>\n<p>Phasing a development can align capital deployment with demand and de-risk the project, releasing capital and evidence before the next stage is committed.</p>\n<h3>Planning with a partner</h3>\n<p>Valunxt&#8217;s Capital Advisory team builds capital plans that anticipate risk and keep large developments funded, phased, and on course.</p>\n",
    "cover_image": "/assets/content/uploads/blogs/blog-2.webp",
    "cover_alt": "Capital Planning for Large Property Developments",
    "author": "Valunxt Research Team",
    "author_role": "Capital Advisory Desk",
    "published_at": "2026-07-09",
    "meta_title": "Capital Planning for Large Property Developments | Valunxt",
    "meta_description": "Large developments rarely fail for lack of a good idea; they fail for lack of a capital plan mapped across the full lifecycle.",
    "og_image": "/assets/content/uploads/blogs/blog-2.webp"
  },
  {
    "slug": "why-market-intelligence-matters-before-every-property-investment",
    "title": "Why Market Intelligence Matters Before Every Property Investment",
    "category": "Research & Intelligence",
    "excerpt": "The best investment decisions are made before the deal, not during it &#8212; independent intelligence turns conviction into evidence.",
    "body": "\n<p>The best investment decisions are made before the deal, not during it. Independent market intelligence covering pricing, demand, supply, and risk transforms conviction into evidence while safeguarding capital from preventable errors.</p>\n<h3>Every market is local</h3>\n<p>Headline national trends conceal enormous variation at the micro-market level. Intelligence on the specific corridor, asset type, and demand drivers is what actually informs a decision.</p>\n<h3>Pricing power comes from information</h3>\n<p>Investors who understand true value negotiate from strength. Market intelligence reveals whether an asset is fairly priced, over-hyped, or genuinely mispriced.</p>\n<h3>Anticipating risk</h3>\n<p>Supply pipelines, absorption rates, and economic signals warn of oversupply or softening demand long before they hit valuations. Intelligence buys time to act.</p>\n<h3>Intelligence you can act on</h3>\n<p>Valunxt&#8217;s Research &amp; Intelligence practice delivers independent, decision-ready analysis before every investment, replacing guesswork with evidence.</p>\n",
    "cover_image": "/assets/content/uploads/blogs/blog-3.webp",
    "cover_alt": "Why Market Intelligence Matters Before Every Property Investment",
    "author": "Valunxt Research Team",
    "author_role": "Research & Intelligence Desk",
    "published_at": "2026-06-18",
    "meta_title": "Why Market Intelligence Matters Before Every Property Investment | Valunxt",
    "meta_description": "The best investment decisions are made before the deal, not during it; independent intelligence turns conviction into evidence.",
    "og_image": "/assets/content/uploads/blogs/blog-3.webp"
  },
  {
    "slug": "the-future-of-automated-valuation-models-avms",
    "title": "The Future of Automated Valuation Models (AVMs)",
    "category": "Technology & AI",
    "excerpt": "Automated valuation models are reshaping how quickly property can be valued &#8212; knowing their strengths and limits is essential.",
    "body": "\n<p>Automated valuation models are reshaping how quickly and consistently property can be valued. Understanding their strengths &#8212; and their limits &#8212; is essential to using them well in serious investment decisions.</p>\n<h3>How AVMs work</h3>\n<p>AVMs use statistical and machine-learning models trained on large datasets of transactions and property attributes to estimate value quickly and at scale.</p>\n<h3>Where they excel</h3>\n<p>For liquid, homogeneous assets with abundant data, AVMs deliver fast, consistent, and cost-effective estimates &#8212; ideal for screening, monitoring, and portfolio-level views.</p>\n<h3>Where judgement is still required</h3>\n<p>Unique assets, thin data, and rapidly changing markets expose the limits of automation. Here, expert valuation and local insight remain indispensable.</p>\n<h3>The hybrid future</h3>\n<p>The future is not AVM versus valuer, but AVM plus valuer. Valunxt&#8217;s technology and research teams combine automated models with expert oversight.</p>\n",
    "cover_image": "/assets/content/uploads/blogs/blog-4.webp",
    "cover_alt": "The Future of Automated Valuation Models (AVMs)",
    "author": "Valunxt Research Team",
    "author_role": "Technology & AI Desk",
    "published_at": "2026-05-26",
    "meta_title": "The Future of Automated Valuation Models (AVMs) | Valunxt",
    "meta_description": "Automated valuation models are reshaping how quickly property can be valued; knowing their strengths and limits is essential.",
    "og_image": "/assets/content/uploads/blogs/blog-4.webp"
  }
];

const TABLE_SQL = `CREATE TABLE IF NOT EXISTS blog_posts (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title            VARCHAR(200)  NOT NULL DEFAULT '',
  slug             VARCHAR(190)  NOT NULL DEFAULT '',
  category         VARCHAR(120)  NOT NULL DEFAULT '',
  excerpt          TEXT          NULL,
  body             MEDIUMTEXT    NULL,
  cover_image      VARCHAR(255)  NOT NULL DEFAULT '',
  cover_alt        VARCHAR(255)  NOT NULL DEFAULT '',
  author           VARCHAR(160)  NOT NULL DEFAULT '',
  author_role      VARCHAR(160)  NOT NULL DEFAULT '',
  status           VARCHAR(20)   NOT NULL DEFAULT 'draft',
  featured         TINYINT(1)    NOT NULL DEFAULT 0,
  in_sitemap       TINYINT(1)    NOT NULL DEFAULT 1,
  published_at     DATE          NULL DEFAULT NULL,
  meta_title       VARCHAR(255)  NOT NULL DEFAULT '',
  meta_description TEXT          NULL,
  meta_keywords    VARCHAR(500)  NOT NULL DEFAULT '',
  og_image         VARCHAR(255)  NOT NULL DEFAULT '',
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_slug (slug),
  KEY idx_blog_live (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const conn = await mysql.createConnection({ ...cfg, charset: 'utf8mb4' });
await conn.query(TABLE_SQL);

let added = 0;
let skipped = 0;
for (const p of POSTS) {
  const [rows] = await conn.query('SELECT id FROM blog_posts WHERE slug = ? LIMIT 1', [p.slug]);
  if (rows.length) {
    skipped++;
    console.log(`skip  ${p.slug} (already present)`);
    continue;
  }
  await conn.query(
    `INSERT INTO blog_posts
        (title, slug, category, excerpt, body, cover_image, cover_alt, author, author_role,
         status, featured, in_sitemap, published_at, meta_title, meta_description, meta_keywords, og_image)
     VALUES (?,?,?,?,?,?,?,?,?,'published',0,1,?,?,?,'',?)`,
    [
      p.title, p.slug, p.category, p.excerpt, p.body, p.cover_image, p.cover_alt,
      p.author, p.author_role, p.published_at, p.meta_title, p.meta_description, p.og_image,
    ],
  );
  added++;
  console.log(`added ${p.slug}`);
}

await conn.end();
console.log(`done — ${added} added, ${skipped} already there.`);
