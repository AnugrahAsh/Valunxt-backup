import { definePage } from '@/lib/page-factory';
import PageHeroSection from '@/components/sections/PageHeroSection';
import PlatformSection from '@/components/sections/PlatformSection';

const { generateMetadata, Page } = definePage('/services/technology-ai/platform/', ({ page, region }) => (
  <>
    <PageHeroSection page={page} region={region} />
    <PlatformSection region={region} />
  </>
));

export { generateMetadata };
export default Page;
