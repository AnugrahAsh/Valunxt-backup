import { definePage } from '@/lib/page-factory';
import PageHeroSection from '@/components/sections/PageHeroSection';
import CommunitySection from '@/components/sections/CommunitySection';

const { generateMetadata, Page } = definePage('/community/', ({ page, region }) => (
  <>
    <PageHeroSection page={page} region={region} />
    <CommunitySection region={region} />
  </>
));

export { generateMetadata };
export default Page;
