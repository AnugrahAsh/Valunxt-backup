/**
 * The newest published insights, from the same table the site's blog reads,
 * so the landing page can never point at a retired article. Renders nothing
 * when there are none.
 */
import type { BlogCard } from '@/lib/blog/types';
import { rurl } from '@/lib/region';
import type { Locale } from '../../lib/types';
import { INSIGHTS_HEAD } from '../../data/landing';
import { IcArrowUp, SectionHead } from './shared';

export default function Insights({ posts, locale }: { posts: BlogCard[]; locale: Locale }) {
  if (!posts.length) return null;
  return (
    <section className="re-l-sec re-l-ins" id="insights">
      <div className="re-wrap">
        <SectionHead eyebrow={INSIGHTS_HEAD.eyebrow} title={INSIGHTS_HEAD.title}>
          <a className="re-l-link re-l-head__cta" href={rurl(locale, '/blogs/')} data-rv="up" data-rv-i="3">
            {INSIGHTS_HEAD.cta}
            <IcArrowUp />
          </a>
        </SectionHead>
        <div className="re-l-ins__grid">
          {posts.slice(0, 3).map((p, i) => (
            <a className="re-l-post" href={rurl(locale, `/blogs/${p.slug}/`)} key={p.slug} data-rv="up" data-rv-i={i}>
              <span className="re-l-post__shot">
                {p.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image} alt={p.cover_alt || ''} loading="lazy" />
                ) : null}
              </span>
              <span className="re-l-post__meta">
                <em>{p.category}</em>
                <time dateTime={p.date_iso}>{p.date}</time>
              </span>
              <span className="re-l-post__title">{p.title}</span>
              <span className="re-l-post__excerpt">{p.excerpt}</span>
              <span className="re-l-post__read">
                {p.read_mins} min read
                <IcArrowUp />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
