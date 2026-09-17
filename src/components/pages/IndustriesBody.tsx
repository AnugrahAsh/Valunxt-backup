/**
 * /industries/ — page body.
 *
 * Port of industries/index.php. The captured Elementor markup is unchanged: the only
 * edits are the ones JSX requires (className, self-closed voids, style
 * objects) and internal links going through rurl() so they stay in the
 * visitor's market.
 */
import { rurl } from '@/lib/region';
import IndustriesSectorsSection from '@/components/sections/IndustriesSectorsSection';
import type { PageConfig } from '@/lib/page-config';

export default function IndustriesBody({ page, region }: { page: PageConfig; region: string }) {
  return (
    <>

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
      										<span className="elementor-heading-title elementor-size-default">&gt; Industries</span>
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
      										<h1 className="elementor-heading-title elementor-size-default">Industries &amp; Sectors</h1>
      									</div>
      								</div>
      								<div className="elementor-element elementor-element-44a505e elementor-invisible animated-fast elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="44a505e" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\"}"} data-widget_type="theme-post-title.default">
      									<div className="elementor-widget-container">
      										<h2 className="elementor-heading-title elementor-size-default">Industries</h2>
      									</div>
      								</div>
      								<div className="elementor-element elementor-element-44a2511 elementor-invisible animated-fast elementor-widget__width-initial elementor-widget-mobile__width-inherit elementor-widget elementor-widget-theme-post-excerpt" data-id="44a2511" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\",\"_animation_delay\":50}"} data-widget_type="theme-post-excerpt.default">
      									<div className="elementor-widget-container">
      										Residential, office, retail, warehousing, land and hospitality &mdash; the sectors we value, research and fund, and the clients we act for in each. </div>
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
      										<style id="vxn-ind-intro-css" dangerouslySetInnerHTML={{ __html: `
      											.elementor-262 .vxn-ind-intro {
      												display: grid;
      												grid-template-columns: 1fr 1fr;
      												gap: 22px 64px;
      												align-items: start;
      												margin: 0 0 52px;
      											}

      											.elementor-262 .vxn-ind-intro p.vxn-ind-intro__eyebrow {
      												font-family: "Inter", sans-serif !important;
      												font-size: 12px !important;
      												letter-spacing: .2em !important;
      												text-transform: uppercase !important;
      												color: #0E355F !important;
      												font-weight: 600 !important;
      												margin: 0 0 14px !important;
      											}

      											.elementor-262 .vxn-ind-intro h2.vxn-ind-intro__title {
      												font-family: "Inter", sans-serif !important;
      												font-weight: 400 !important;
      												color: #0E355F !important;
      												font-size: clamp(28px, 3.4vw, 44px) !important;
      												line-height: 1.12 !important;
      												margin: 0 !important;
      											}

      											.elementor-262 .vxn-ind-intro p.vxn-ind-intro__lead {
      												font-family: "Inter", sans-serif !important;
      												font-size: 17px !important;
      												line-height: 1.8 !important;
      												color: #4d5863 !important;
      												margin: 0 !important;
      											}

      											@media(max-width:900px) {
      												.elementor-262 .vxn-ind-intro {
      													grid-template-columns: 1fr;
      													gap: 14px;
      													margin-bottom: 36px;
      												}
      											}
      										` }} />
      										<IndustriesSectorsSection region={region} />
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
