import { definePage } from '@/lib/page-factory';
import PageHeroSection from '@/components/sections/PageHeroSection';
import FaqSection from '@/components/sections/FaqSection';

const { generateMetadata, Page } = definePage('/faq/', ({ page, region }) => (
  <>
    <PageHeroSection page={page} region={region} />
    <FaqSection region={region} />
  </>
));

export { generateMetadata };
export default Page;
