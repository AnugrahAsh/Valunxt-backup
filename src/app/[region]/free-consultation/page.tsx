/**
 * /free-consultation/ — one per market.
 *
 * India keeps the captured Elementor page (FreeConsultationBody, which carries
 * its own subscribe template). The UAE's page is set in the service pages'
 * language (FreeConsultationAeBody) and takes the shared subscribe band after
 * it, as the UAE services index does.
 */
import { definePage } from '@/lib/page-factory';
import FreeConsultationBody from '@/components/pages/FreeConsultationBody';
import FreeConsultationAeBody from '@/components/pages/FreeConsultationAeBody';

const { generateMetadata, Page } = definePage('/free-consultation/', ({ page, region }) =>
  region === 'en-ae' ? (
    <>
      <FreeConsultationAeBody page={page} region={region} />
    </>
  ) : (
    <FreeConsultationBody page={page} region={region} />
  ),
);

export { generateMetadata };
export default Page;
