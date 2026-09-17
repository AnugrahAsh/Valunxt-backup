/**
 * /blogs/ — page body.
 *
 * Port of blogs/index.php. The header (breadcrumb, H1, excerpt) is the
 * captured Elementor markup, unchanged. The grid itself is not (20260918):
 * client instruction replaced the Elementor loop-grid's plain date+title
 * card with the tile the article page's "More Insights" grid already used —
 * a category eyebrow, a serif title and a circular arrow — so both surfaces
 * share one card, `BlogCardTile`.
 */
import { rurl } from '@/lib/region';
import BlogCardTile, { BLOG_TILE_CSS } from './BlogCardTile';
import BlogPager from './BlogPager';
import type { BlogCard } from '@/lib/blog/types';
import type { PageConfig } from '@/lib/page-config';

const CSS = `
.vxn-tile-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:26px;}
@media(max-width:1100px){.vxn-tile-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:768px){.vxn-tile-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:520px){.vxn-tile-grid{grid-template-columns:1fr;}}
${BLOG_TILE_CSS}
`;

export default function BlogsBody({
  page,
  region,
  posts,
  currentPage,
  totalPages,
}: {
  page: PageConfig;
  region: string;
  /** This page's 8 cards, in display order — the route already sliced them. */
  posts: BlogCard[];
  currentPage: number;
  totalPages: number;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div id="main-content">

      	<div id="main" role="main" className="vamtam-main layout-full">





      		<article id="post-262" className="full post-262 page type-page status-publish hentry">
      			<div data-elementor-type="single-page" data-elementor-id="3752" className="elementor elementor-3752 elementor-location-single post-262 page type-page status-publish hentry" data-elementor-post-type="elementor_library">
      				<div className="elementor-element elementor-element-c4d353f e-flex e-con-boxed e-con e-parent" data-id="c4d353f" data-element_type="container" data-e-type="container" data-settings={"{\"background_background\":\"classic\"}"}>
      					<div className="e-con-inner">
      						<div className="elementor-element elementor-element-6200b41 e-con-full e-flex e-con e-child" data-id="6200b41" data-element_type="container" data-e-type="container">
      							<div className="elementor-element elementor-element-7b36cfb e-con-full e-flex e-con e-child" data-id="7b36cfb" data-element_type="container" data-e-type="container">
      								<div className="elementor-element elementor-element-c739b5b elementor-widget elementor-widget-heading" data-id="c739b5b" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
      									<div className="elementor-widget-container">
      										<span className="elementor-heading-title elementor-size-default"><a href={rurl(region, '/')}>Home</a></span>
      									</div>
      								</div>
      								<div className="elementor-element elementor-element-1707a75 elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="1707a75" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-title.default">
      									<div className="elementor-widget-container">
      										<span className="elementor-heading-title elementor-size-default">&gt; Insights</span>
      									</div>
      								</div>
      							</div>
      							<div className="elementor-element elementor-element-3f5733d elementor-widget-divider--view-line elementor-widget elementor-widget-divider" data-id="3f5733d" data-element_type="widget" data-e-type="widget" data-widget_type="divider.default">
      								<div className="elementor-widget-container">
      									<div className="elementor-divider">
      										<span className="elementor-divider-separator">
      										</span>
      									</div>
      								</div>
      							</div>
      							<div className="elementor-element elementor-element-8c0b074 e-con-full e-flex e-con e-child" data-id="8c0b074" data-element_type="container" data-e-type="container">
      								<div className="elementor-element elementor-element-16f0cb0 elementor-invisible animated-fast elementor-widget elementor-widget-heading" data-id="16f0cb0" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\"}"} data-widget_type="heading.default">
      									<div className="elementor-widget-container">
      										<h1 className="elementor-heading-title elementor-size-default">Insights</h1>
      									</div>
      								</div>
      								<div className="elementor-element elementor-element-44a505e elementor-invisible animated-fast elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="44a505e" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\"}"} data-widget_type="theme-post-title.default">
      									<div className="elementor-widget-container">
      										<h2 className="elementor-heading-title elementor-size-default">Insights</h2>
      									</div>
      								</div>
      								<div className="elementor-element elementor-element-44a2511 elementor-invisible animated-fast elementor-widget__width-initial elementor-widget-mobile__width-inherit elementor-widget elementor-widget-theme-post-excerpt" data-id="44a2511" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\",\"_animation_delay\":50}"} data-widget_type="theme-post-excerpt.default">
      									<div className="elementor-widget-container">
      										Institutional insights on real estate wealth, capital advisory, research, and technology across India and the UAE from Valunxt. </div>
      								</div>
      							</div>
      						</div>
      					</div>
      				</div>
      				<div className="elementor-element elementor-element-afe1311 e-con-full e-flex e-con e-parent" data-id="afe1311" data-element_type="container" data-e-type="container">
      					<div className="elementor-element elementor-element-9851ed0 elementor-widget elementor-widget-theme-post-content" data-id="9851ed0" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-content.default">
      						<div className="elementor-widget-container">
      							<div data-elementor-type="wp-page" data-elementor-id="262" className="elementor elementor-262" data-elementor-post-type="page">
      								<div className="elementor-element elementor-element-3828824 e-flex e-con-boxed e-con e-parent" data-id="3828824" data-element_type="container" data-e-type="container">
      									<div className="e-con-inner">
      										<div className="elementor-element elementor-element-5fec592 elementor-grid-4 elementor-grid-tablet-3 elementor-grid-mobile-1 elementor-widget elementor-widget-loop-grid" data-id="5fec592" data-element_type="widget" data-e-type="widget" data-settings={"{\"template_id\":\"1961\",\"columns\":4,\"pagination_type\":\"load_more_on_click\",\"row_gap\":{\"unit\":\"px\",\"size\":45,\"sizes\":[]},\"columns_tablet\":3,\"row_gap_tablet\":{\"unit\":\"px\",\"size\":30,\"sizes\":[]},\"_skin\":\"post\",\"columns_mobile\":\"1\",\"edit_handle_selector\":\"[data-elementor-type=\\\"loop-item\\\"]\",\"load_more_spinner\":{\"value\":\"fas fa-spinner\",\"library\":\"fa-solid\"},\"row_gap_mobile\":{\"unit\":\"px\",\"size\":\"\",\"sizes\":[]}}"} data-widget_type="loop-grid.post">
      											<div className="elementor-widget-container">
      												<div className="vxn-tile-grid" role="list">
      													{posts.map((post) => (
      														<BlogCardTile key={post.slug} post={post} region={region} />
      													))}
      												</div>
      												<BlogPager region={region} currentPage={currentPage} totalPages={totalPages} />
      											</div>
      										</div>
      									</div>
      								</div>
      							</div>
      						</div>
      					</div>
      				</div>
      			</div>
      		</article>






      	</div>{/* #main */}

      </div>
    </>
  );
}
