/**
 * One Insights card — the Elementor loop item (template 1961) that every
 * surface showing blog posts renders.
 *
 * Three places used to write this markup out by hand, once per post: the
 * /blogs/ grid, and the carousel that closes each market's home page. The four
 * posts were fixed, so the copy was too — the home carousel stamped every card
 * "July 11, 2026" whatever it linked to. It is one component over one query
 * now, and the markup is the capture unchanged: the same classes, the same
 * data attributes, the same nesting.
 *
 * `variant` is the only difference between the two surfaces. The grid renders a
 * plain loop item; the carousel renders the same item as a Swiper slide.
 */
import { BASE, rurl } from '@/lib/region';
import { uaePageImage } from '@/lib/uae-page-images';
import type { BlogCard } from '@/lib/blog/types';

/**
 * A stable four-digit stand-in for the WordPress post id the captured markup
 * carried on every loop item. Nothing styles it — the Elementor rules key off
 * .elementor-1961 and the element ids — but it is part of the class list the
 * theme's own scripts walk, so each card keeps one of its own.
 */
export function blogLoopId(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return 1000 + (Math.abs(h) % 1000);
}

/** "Real Estate Wealth" -> "category-real-estate-wealth", as WordPress wrote it. */
function categoryClass(category: string): string {
  const slug = String(category)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? ' category-' + slug : '';
}

export default function BlogLoopCard({
  post,
  index,
  region,
  variant = 'grid',
}: {
  post: BlogCard;
  /** Position in the list — the grid loaded its first two covers eagerly. */
  index: number;
  region: string;
  variant?: 'grid' | 'slide';
}) {
  const id = blogLoopId(post.slug);
  const href = rurl(region, `/blogs/${post.slug}/`);
  const img = uaePageImage(region, `blogs/${post.slug}`, BASE + post.cover_image);
  const slide = variant === 'slide';

  /* The capture loaded the grid's first two covers eagerly and deferred the
     rest; every slide in the carousel was deferred. */
  const priority =
    slide || index > 2
      ? { loading: 'lazy' as const }
      : index < 2
        ? { fetchPriority: 'high' as const }
        : {};

  const outerClass =
    `elementor elementor-1961${slide ? ' swiper-slide' : ''} e-loop-item e-loop-item-${id} post-${id} ` +
    `post type-post status-publish format-standard has-post-thumbnail hentry${categoryClass(post.category)}`;

  return (
    <div
      data-elementor-type="loop-item"
      data-elementor-id="1961"
      className={outerClass}
      data-elementor-post-type="elementor_library"
      {...(slide ? { role: 'group', 'aria-roledescription': 'slide' } : {})}
      data-custom-edit-handle="1"
    >
      <div className="elementor-element elementor-element-8b3458c animated-fast e-flex e-con-boxed e-con e-parent" data-id="8b3458c" data-element_type="container" data-e-type="container" data-settings={"{\"animation\":\"none\",\"animation_delay\":100}"}>
        <div className="e-con-inner">
          <div className="elementor-element elementor-element-9b0d8db animated-fast elementor-widget elementor-widget-theme-post-featured-image elementor-widget-image" data-id="9b0d8db" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"none\"}"} data-widget_type="theme-post-featured-image.default">
            <div className="elementor-widget-container">
              <a href={href}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...priority} decoding="async" width={750} height={1024} src={img} className={`attachment-large size-large wp-image-${id}`} alt={post.cover_alt} /> </a>
            </div>
          </div>
          <div className="elementor-element elementor-element-e4b59e9 e-con-full e-flex e-con e-child" data-id="e4b59e9" data-element_type="container" data-e-type="container">
            <div className="elementor-element elementor-element-923a9ab elementor-widget elementor-widget-post-info" data-id="923a9ab" data-element_type="widget" data-e-type="widget" data-widget_type="post-info.default">
              <div className="elementor-widget-container">
                <ul className="elementor-inline-items elementor-icon-list-items elementor-post-info">
                  <li className="elementor-icon-list-item elementor-repeater-item-3c380d1 elementor-inline-item" itemProp="datePublished">
                    <span className="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-date">
                      <time dateTime={post.date_iso}>{post.date}</time> </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="elementor-element elementor-element-74fce07 elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="74fce07" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-title.default">
            <div className="elementor-widget-container">
              <h5 className="elementor-heading-title elementor-size-default"><a href={href}>{post.title}</a></h5>
            </div>
          </div>
          {/* The excerpt is authored copy and carries HTML entities, exactly as
              the captured markup did; React would print them literally. */}
          <div className="elementor-element elementor-element-abced80 vamtam-show-on-hover elementor-widget elementor-widget-theme-post-excerpt" data-id="abced80" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-excerpt.default">
            <div className="elementor-widget-container" dangerouslySetInnerHTML={{ __html: post.excerpt + ' ' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
