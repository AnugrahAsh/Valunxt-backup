/**
 * Blog article layout (editorial reading page).
 *
 * Rebuilt 20260917 against the client's reference (valunxt.com/insights/…):
 * a breadcrumb + category chip + title + lede + byline row over the cover
 * photo, a sticky "In this article" + share + topics rail beside a wider
 * reading column (drop cap, gradient-tick headings, pull-quote style
 * blockquotes), an author card, a full-width CTA band and a "More Insights"
 * grid (BlogCardTile — the same tile the /blogs/ listing renders, per
 * 20260918 instruction that the two surfaces share one card).
 *
 * THE HERO (20260918, second pass): the photo is now the full width of the
 * band again, as the reference has it — the split-panel version from the
 * first pass turned out to hide MORE of the image (a flat solid half) than
 * the reference's own gradient does, which was the opposite of the client's
 * "avoid a dark overlay" instruction. `.vxn-art-hero__shade` is that
 * reference gradient, solid only where the title sits and clear over the
 * rest of the photo, not a flat tint over the whole thing.
 *
 * Port of includes/partials/blog-article.php, since extended past it.
 */
import { BASE, rurl } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
import { uaePageImage } from '@/lib/uae-page-images';
import { vxnRequestOrigin } from '@/lib/seo';
import { blogToc } from '@/lib/blog/toc';
import ArticleToc from './ArticleToc';
import ShareButtons from './ShareButtons';
import BlogCardTile, { BLOG_TILE_CSS } from '@/components/pages/BlogCardTile';
import type { BlogCard } from '@/lib/blog/types';
import Html from '@/components/Html';
import type { PageConfig } from '@/lib/page-config';

export interface Article {
  slug: string;
  title: string;
  category?: string;
  /** The excerpt/meta description, shown as the hero's lede. */
  lede?: string;
  hero_image?: string;
  /** The cover's alt text; the hero is a CSS background, so it is exposed as a label. */
  hero_alt?: string;
  author?: string;
  author_role?: string;
  /** The author profile's photo, when it has one; the initial otherwise. */
  author_avatar?: string;
  author_bio?: string;
  /** The article body, as HTML. */
  body: string;
  read_time?: string;
  topics?: string[];
  date?: string;
  date_iso?: string;
  /** Question and answer pairs, shown after the body. */
  faq?: Array<{ q: string; a: string }>;
}

const CSS = `
/* ===== Valunxt blog article (editorial) ===== */
.vxn-article{background:#fff;color:#1a2733;font-family:"DM Sans",sans-serif;}

/* --- hero: the photo is the full width of the band; the gradient veil sits
   solid only behind the text and clears to nothing over the rest of the
   photo (see the file header for why this replaced the split-panel take). --- */
.vxn-art-hero{position:relative;overflow:hidden;border-radius:20px;color:#fff;min-height:460px;display:flex;align-items:center; width:98%; margin:auto;}
.vxn-art-hero__media{position:absolute;inset:0;background-size:cover;background-position:80% center;}
.vxn-art-hero__shade{position:absolute;inset:0;background:
    linear-gradient(100deg,#0E355F 0%,#0E355F 40%,rgba(14,53,95,.78) 58%,rgba(14,53,95,.4) 78%,rgba(14,53,95,.1) 100%),
    linear-gradient(180deg,rgba(14,53,95,.22) 0%,transparent 36%,rgba(14,53,95,.48) 100%);
}
.vxn-art-hero__inner{position:relative;z-index:1;width:100%;max-width:100%;margin:0 auto;box-sizing:border-box;padding:56px 48px;}
.vxn-art-hero__text{max-width:620px;}
.vxn-art-crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12.5px;color:rgba(255,255,255,.68);margin-bottom:20px;}
.vxn-art-crumbs a{color:rgba(255,255,255,.68);text-decoration:none;}
.vxn-art-crumbs a:hover{color:#fff;text-decoration:underline;}
.vxn-art-crumbs span{color:rgba(255,255,255,.4);}
.vxn-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(11,45,190,.22);color:#8FB7FF;border:1px solid rgba(143,183,255,.4);padding:5px 12px;border-radius:3px;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px;}
.vxn-article .vxn-art-hero__title{font-family:"Forum",serif!important;font-weight:400!important;font-size:clamp(28px,4vw,46px);line-height:1.1;margin:0 0 14px;color:#fff!important;}
.vxn-art-hero__lede{margin:0;font-size:15.5px;line-height:1.7;color:rgba(255,255,255,.8);max-width:52ch;}
.vxn-art-hero__meta{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:26px;}
.vxn-art-hero__meta .vxn-vr{width:1px;height:26px;background:rgba(255,255,255,.18);}
.vxn-art-hero__meta .vxn-by{display:flex;flex-direction:column;gap:3px;}
.vxn-art-hero__meta .vxn-by small{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5);}
.vxn-art-hero__meta .vxn-by b{font-size:14px;font-weight:600;color:#fff;}

.vxn-art-wrap{max-width:90%;margin:0 auto;padding:58px 32px 0;display:grid;grid-template-columns:minmax(0,7fr) minmax(0,3fr);gap:60px;}
.vxn-art-content{color:#3d4a56;font-size:17px;line-height:1.85;max-width:none;}
.vxn-art-content p{margin:0 0 22px;}
.vxn-art-content>p:first-of-type::first-letter{float:left;font-family:"Forum",serif;font-weight:400;font-size:3.3em;line-height:.82;padding:6px 10px 0 0;color:#0E355F;}
.vxn-art-content h2{font-family:"Forum",serif;font-weight:400;color:#0E355F;font-size:clamp(23px,2.6vw,29px);line-height:1.22;margin:48px 0 16px;scroll-margin-top:110px;}
.vxn-art-content h2::before{content:"";display:block;width:36px;height:3px;border-radius:3px;background:linear-gradient(115deg,#0B2DBE 0%,#0E355F 100%);margin-bottom:16px;}
.vxn-art-content h3{font-family:"Forum",serif;font-weight:400;color:#0E355F;font-size:22px;line-height:1.25;margin:34px 0 12px;scroll-margin-top:110px;}
.vxn-art-content a{color:#0B2DBE;text-decoration:underline;text-underline-offset:2px;}
.vxn-art-content img{max-width:100%;height:auto;border-radius:6px;margin:8px 0 26px;}
.vxn-art-content ul,.vxn-art-content ol{margin:0 0 22px;padding-left:22px;}
.vxn-art-content li{margin:0 0 8px;}
.vxn-art-content table{width:100%;display:block;overflow-x:auto;border-collapse:collapse;margin:12px 0 28px;font-size:15px;}
.vxn-art-content th,.vxn-art-content td{border:1px solid #e7e2d9;padding:10px 14px;text-align:left;}
.vxn-art-content th{background:#f7f6f3;color:#0E355F;font-weight:600;}
.vxn-art-content blockquote{margin:36px 0;padding:2px 0 2px 24px;border-left:3px solid #0B2DBE;font-family:"Forum",serif;font-weight:400;font-size:clamp(19px,2vw,22px);line-height:1.5;color:#16233B;}

.vxn-art-side{align-self:start;position:sticky;top:110px;display:flex;flex-direction:column;gap:0;}
.vxn-art-toc{padding-bottom:24px;margin-bottom:24px;border-bottom:1px solid #e7e2d9;}
.vxn-art-toc ol{list-style:none;margin:0;padding:0;border-left:1px solid #e5e1d8;}
.vxn-art-toc a{display:block;padding:7px 0 7px 15px;margin-left:-1px;border-left:2px solid transparent;font-size:13.5px;line-height:1.45;color:#6A7590;text-decoration:none;transition:color .25s,border-color .25s;}
.vxn-art-toc a:hover{color:#0E355F;}
.vxn-art-toc a.on{color:#0B2DBE;border-left-color:#0B2DBE;font-weight:600;}
.vxn-side-block{padding:22px 0;border-bottom:1px solid #e7e2d9;}
.vxn-side-label{font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#9aa1a9;margin-bottom:14px;}
.vxn-side-share{display:flex;flex-wrap:wrap;gap:10px;}
.vxn-side-share a,.vxn-side-share button{width:38px;height:38px;padding:0;margin:0;border-radius:50%;border:1px solid #d9d3c8;background:#fff;font:inherit;display:flex;align-items:center;justify-content:center;color:#0B2DBE;cursor:pointer;transition:.2s;}
.vxn-side-share a:hover,.vxn-side-share button:hover{background:#0E355F;border-color:#0E355F;color:#fff;}
.vxn-side-share svg{width:16px;height:16px;fill:currentColor;}
.vxn-side-share svg[stroke]{fill:none;}
.vxn-side-topics{display:flex;flex-wrap:wrap;gap:8px 14px;}
.vxn-side-topics a{color:#0B2DBE;font-size:14px;text-decoration:none;border-bottom:1px solid transparent;}
.vxn-side-topics a:hover{border-color:#0B2DBE;}

/* --- author card, foot of the reading column --- */
.vxn-art-author{display:flex;align-items:center;gap:22px;flex-wrap:wrap;margin:12px 0 0;padding:28px;max-width:760px;background:#f7f6f3;border:1px solid #e7e2d9;border-radius:16px;}
.vxn-art-author__bio{flex:1;min-width:220px;}
.vxn-art-author small{display:block;font-size:10.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#9aa1a9;margin-bottom:4px;}
.vxn-art-author h3{font-family:"Forum",serif;font-weight:400;font-size:19px;color:#0E355F;margin:0 0 6px;}
.vxn-art-author p{font-size:14px;line-height:1.65;color:#6A7590;margin:0;}
.vxn-art-author .btn-ghost{flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;padding:0 22px;height:44px;border-radius:999px;border:1.5px solid #d9d3c8;color:#0E355F;font-size:14px;font-weight:600;text-decoration:none;transition:.2s;}
.vxn-art-author .btn-ghost:hover{border-color:#0B2DBE;color:#0B2DBE;}

.vxn-avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#0B2DBE,#0E355F);display:flex;align-items:center;justify-content:center;flex:0 0 auto;box-shadow:inset 0 0 0 2px #0B2DBE;}
.vxn-avatar span{font-family:"Forum",serif;color:#fff;font-size:24px;line-height:1;}
.vxn-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;}
.vxn-avatar.lg{width:56px;height:56px;}

/* An article's FAQ (vx_posts.faq_json). */
.vxn-art-faq{margin:48px 0 0;padding-top:8px;border-top:1px solid #e7e2d9;}
.vxn-art-faq__item{border-bottom:1px solid #e7e2d9;}
.vxn-art-faq__item summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:18px;padding:20px 0;font-weight:600;font-size:17px;line-height:1.45;color:#0E355F;}
.vxn-art-faq__item summary::-webkit-details-marker{display:none;}
.vxn-art-faq__item summary::after{content:"+";flex:0 0 auto;font-size:22px;line-height:1;color:#0B2DBE;transition:transform .2s;}
.vxn-art-faq__item[open] summary::after{transform:rotate(45deg);}
.vxn-art-faq__a{padding:0 0 22px;color:#3d4a56;font-size:16px;line-height:1.75;}

/* --- full-width CTA band, after the two-column layout --- */
.vxn-art-cta{max-width:1200px;margin:56px auto 0;padding:0 32px;}
.vxn-art-cta__panel{position:relative;overflow:hidden;border-radius:20px;padding:clamp(28px,3.6vw,54px);display:flex;flex-direction:column;gap:18px;align-items:flex-start;color:#fff;
  background:radial-gradient(900px 560px at 88% 118%,rgba(11,45,190,.55) 0%,transparent 62%),radial-gradient(820px 560px at 2% -30%,rgba(11,93,222,.5) 0%,transparent 64%),radial-gradient(600px 480px at 58% 46%,rgba(143,183,255,.16) 0%,transparent 68%),linear-gradient(155deg,#03081C 0%,#05173F 46%,#0B2DBE 100%);
  border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.14);}
.vxn-art-cta__panel h2{font-family:"Forum",serif;font-weight:400;color:#fff;font-size:clamp(24px,3vw,34px);margin:0;max-width:22ch;}
.vxn-art-cta__panel p{color:rgba(255,255,255,.8);margin:0;max-width:52ch;font-size:15.5px;line-height:1.7;}
.vxn-art-cta__btn{display:inline-flex;align-items:center;gap:10px;padding:0 28px;height:48px;border-radius:999px;background:#fff;color:#0B2DBE!important;font-weight:600;font-size:14.5px;text-decoration:none;transition:transform .3s;}
.vxn-art-cta__btn:hover{transform:translateY(-2px);}

/* --- More Insights: the same tile the /blogs/ listing uses (BLOG_TILE_CSS,
   appended below), in a 3-up grid rather than the listing's 4-up. --- */
.vxn-art-more{max-width:1200px;margin:64px auto 0;padding:0 32px 80px;}
.vxn-art-more__head{text-align:center;margin-bottom:38px;}
.vxn-art-more h2{font-family:"Forum",serif;font-weight:400;color:#0E355F;font-size:clamp(24px,3vw,32px);margin:0;}
.vxn-art-more__eyebrow{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#0B2DBE;margin-bottom:12px;}
.vxn-art-more__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;}
${BLOG_TILE_CSS}

@media(max-width:960px){
  .vxn-art-wrap{grid-template-columns:1fr;gap:44px;}
  .vxn-art-side{position:static;}
  .vxn-art-more__grid{grid-template-columns:1fr 1fr;}
}
@media(max-width:860px){
  .vxn-art-hero__inner{padding:44px 24px;}
  .vxn-art-hero{border-radius:0;min-height:auto;}
  .vxn-art-wrap{padding:44px 24px 0;}
  .vxn-art-cta,.vxn-art-more{padding-left:24px;padding-right:24px;}
}
@media(max-width:640px){
  .vxn-art-more__grid{grid-template-columns:1fr;}
  .vxn-art-author{padding:22px;}
}
`;

export default async function BlogArticleSection({
  article,
  page,
  region,
  related = [],
}: {
  article: Article;
  page: PageConfig;
  region: string;
  /** The other published posts, for the "More Insights" grid. */
  related?: BlogCard[];
}) {
  const cat = article.category ?? 'Insights';
  const topics = article.topics?.length ? article.topics : [cat];
  const author = article.author ?? 'Valunxt Research Team';
  const arole = article.author_role ?? 'Insights & Analysis Desk';
  const initial = author.trim().slice(0, 1).toUpperCase() || 'V';
  /* The UAE edition's own picture for this article (lib/uae-page-images.ts), shared with its index card and related thumbs. */
  const hero = uaePageImage(region, `blogs/${article.slug}`, `${BASE}${article.hero_image ?? page.og_image ?? ''}`);
  const wordCount = article.body.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const rt = article.read_time ?? `${Math.max(1, Math.round(wordCount / 200))} min read`;
  const { html: body, toc } = blogToc(article.body);

  const origin = await vxnRequestOrigin();
  const url = origin + BASE + (page.path ?? '/');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div id="main-content">
        <div id="main" role="main" className="vamtam-main layout-full">
          <article className="vxn-article">
            <header className="vxn-art-hero">
              <div
                className="vxn-art-hero__media"
                style={{ backgroundImage: `url('${hero}')` }}
                {...(article.hero_alt ? { role: 'img', 'aria-label': article.hero_alt } : {})}
              />
              <div className="vxn-art-hero__shade" aria-hidden="true" />
              <div className="vxn-art-hero__inner">
                <div className="vxn-art-hero__text">
                  <nav className="vxn-art-crumbs" aria-label="Breadcrumb">
                    <a href={rurl(region, '/')}>Home</a>
                    <span aria-hidden="true">/</span>
                    <a href={rurl(region, '/blogs/')}>Insights</a>
                    <span aria-hidden="true">/</span>
                    <span aria-current="page">{cat}</span>
                  </nav>
                  <span className="vxn-badge">{cat}</span>
                  <h1 className="vxn-art-hero__title">{article.title}</h1>
                  {article.lede ? <p className="vxn-art-hero__lede">{article.lede}</p> : null}
                  <div className="vxn-art-hero__meta">
                    <div className="vxn-avatar">
                      {article.author_avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={article.author_avatar} alt="" loading="lazy" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                    <div className="vxn-by">
                      <small>Written by</small>
                      <b>{author}</b>
                    </div>
                    {article.date ? (
                      <>
                        <span className="vxn-vr" aria-hidden="true" />
                        <div className="vxn-by">
                          <small>Published</small>
                          <b>
                            <time {...(article.date_iso ? { dateTime: article.date_iso } : {})}>{article.date}</time>
                          </b>
                        </div>
                      </>
                    ) : null}
                    <span className="vxn-vr" aria-hidden="true" />
                    <div className="vxn-by">
                      <small>Reading time</small>
                      <b>{rt}</b>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <div className="vxn-art-wrap">
              <div className="vxn-art-main">
                <Html className="vxn-art-content" html={body} />
                {article.faq?.length ? (
                  <section className="vxn-art-content vxn-art-faq" aria-labelledby="vxn-art-faq-title">
                    <h2 id="vxn-art-faq-title">Frequently Asked Questions</h2>
                    {article.faq.map((f, i) => (
                      <details className="vxn-art-faq__item" key={i}>
                        <summary>{f.q}</summary>
                        <div className="vxn-art-faq__a">{f.a}</div>
                      </details>
                    ))}
                  </section>
                ) : null}

                <div className="vxn-art-author">
                  <div className="vxn-avatar lg">
                    {article.author_avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={article.author_avatar} alt="" loading="lazy" />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>
                  <div className="vxn-art-author__bio">
                    <small>Written by</small>
                    <h3>{author}</h3>
                    <p>{article.author_bio ?? arole}</p>
                  </div>
                  <a className="btn-ghost" href={rurl(region, '/contact/')}>
                    Talk to Our Team
                  </a>
                </div>
              </div>

              <aside className="vxn-art-side">
                <ArticleToc toc={toc} />

                <div className="vxn-side-block">
                  <div className="vxn-side-label">Share</div>
                  <ShareButtons url={url} title={article.title} />
                </div>

                <div className="vxn-side-block" style={{ borderBottom: 0 }}>
                  <div className="vxn-side-label">Topics</div>
                  <div className="vxn-side-topics">
                    {topics.map((t) => (
                      <a href={rurl(region, '/blogs/')} key={t}>
                        {t}
                      </a>
                    ))}
                  </div>
                </div>
              </aside>
            </div>

            <div className="vxn-art-cta">
              <div className="vxn-art-cta__panel">
                <h2>Want this handled for your business?</h2>
                <p>Book a free consultation — a senior adviser will review your position and give you a fixed-fee scope.</p>
                <a className="vxn-art-cta__btn" href={rurl(region, '/contact/')}>
                  Book a Free Consultation
                  <CtaArrow />
                </a>
              </div>
            </div>

            {related.length ? (
              <section className="vxn-art-more" aria-labelledby="vxn-art-more-title">
                <div className="vxn-art-more__head">
                  <span className="vxn-art-more__eyebrow">Keep Reading</span>
                  <h2 id="vxn-art-more-title">More Insights</h2>
                </div>
                <div className="vxn-art-more__grid">
                  {related.slice(0, 3).map((item) => (
                    <BlogCardTile key={item.slug} post={item} region={region} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        </div>
        {/* #main */}
      </div>
      {/* #main-content */}
    </>
  );
}
