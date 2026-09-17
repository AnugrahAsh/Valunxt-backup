/**
 * The card tile — /blogs/ listing grid and the article page's "More
 * Insights" grid both render this (client instruction 20260918: "same kind
 * of UI on blogs page as given in reference with arrow and card UI").
 *
 * Reference: a rounded photo, a category eyebrow, a serif title, a compact
 * "15 Sep 2026 · 9 min read" line, and a circular arrow that steps forward
 * and inverts to blue on hover. `BLOG_TILE_CSS` is exported rather than
 * embedded here so a page with several tiles renders the stylesheet once,
 * not once per card.
 */
import { BASE, rurl } from '@/lib/region';
import { uaePageImage } from '@/lib/uae-page-images';
import { blogDateShort } from '@/lib/blog/types';
import type { BlogCard } from '@/lib/blog/types';

export const BLOG_TILE_CSS = `
.vxn-tile{display:flex;flex-direction:column;text-decoration:none;color:inherit;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e2d9;transition:transform .35s ease,box-shadow .35s ease;}
.vxn-tile:hover{transform:translateY(-5px);box-shadow:0 30px 60px -34px rgba(11,44,86,.28);}
.vxn-tile__photo{position:relative;aspect-ratio:16/9;background:#0E355F;overflow:hidden;}
.vxn-tile__photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s ease;}
.vxn-tile:hover .vxn-tile__photo img{transform:scale(1.05);}
.vxn-tile__body{position:relative;padding:18px 64px 22px 20px;display:flex;flex-direction:column;gap:8px;flex:1;}
.vxn-tile__cat{font-size:10.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#0B2DBE;}
.vxn-tile__title{font-family:"Inter",sans-serif;font-weight:400;font-size:18px;line-height:1.35;color:#0E355F;}
.vxn-tile__meta{font-size:12.5px;color:#9aa1a9;margin-top:auto;}
.vxn-tile__arrow{position:absolute;right:16px;bottom:16px;width:40px;height:40px;flex:0 0 auto;border-radius:50%;background:rgba(11,44,86,.06);display:flex;align-items:center;justify-content:center;color:#0E355F;transition:transform .35s ease,background .3s,color .3s;}
.vxn-tile__arrow svg{width:16px;height:16px;transition:transform .35s ease;}
.vxn-tile:hover .vxn-tile__arrow{background:#0B2DBE;color:#fff;}
.vxn-tile:hover .vxn-tile__arrow svg{transform:translate(2px,-2px);}
`;

export default function BlogCardTile({ post, region }: { post: BlogCard; region: string }) {
  return (
    <a className="vxn-tile" href={rurl(region, `/blogs/${post.slug}/`)}>
      <div className="vxn-tile__photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={uaePageImage(region, `blogs/${post.slug}`, BASE + post.cover_image)}
          alt={post.cover_alt || post.title}
          loading="lazy"
        />
      </div>
      <div className="vxn-tile__body">
        <span className="vxn-tile__cat">{post.category || 'Insights'}</span>
        <span className="vxn-tile__title">{post.title}</span>
        <span className="vxn-tile__meta">
          {blogDateShort(post.date_iso)} &middot; {post.read_mins} min read
        </span>
        <span className="vxn-tile__arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M8 7h9v9" />
          </svg>
        </span>
      </div>
    </a>
  );
}
