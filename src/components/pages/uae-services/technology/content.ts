/**
 * What /en-ae/services/technology-data-ai/ says.
 *
 * THE COPY IS THE CLIENT'S page document (20260911), word for word, on the
 * service template, under the same two rules as the home page: nothing added
 * to the document or dropped from it, and no em dashes anywhere on the UAE
 * pages. Three proof points, as the document gives; every tab has a button
 * of its own.
 *
 * SUB-SERVICE SLUGS resolve through vxnServices('en-ae'), so every slug below
 * exists in that registry and the strip cannot point at a 404.
 */
import type { ServiceTemplateContent } from '../template/types';

export const TECHNOLOGY_TEMPLATE: ServiceTemplateContent = {
  slug: 'technology-data-ai',
  crumb: 'Technology & AI',
  hero: {
    head: 'Technology That Turns Complexity Into Capability.',
    sub: 'Technology, data and AI solutions that connect systems, automate processes and turn business information into measurable performance.',
    image: ['banners/services-banner.webp', 'services/technology-hero.webp', 'homepage/technology-and-ai.webp'],
    alt: 'Two engineers with a laptop in a server room',
  },
  intro: {
    head: 'One Technology Partner. From Digital Strategy to Business Performance.',
    lede: 'Valunxt brings technology consulting, data intelligence and AI together to help businesses modernise operations, connect information and build systems designed around how they work.',
    proof: [
      { label: 'Technology & Digital Strategy', note: 'Align technology investments with operational priorities and business objectives.' },
      { label: 'Data, Automation & AI', note: 'Turn fragmented processes and information into connected, intelligent workflows.' },
      { label: 'Enterprise Technology', note: 'Build scalable systems, dashboards and digital infrastructure around evolving business needs.' },
    ],
    chips: ['5 Technology Verticals', '1 Integrated Ecosystem'],
    primary: { label: 'Speak to an Advisor', href: '/free-consultation/' },
    secondary: { label: 'Explore Technology Services', href: '#at-services' },
    image: ['services/technology-intro.webp', 'new-folder/technology-ai-1.webp'],
  },
  strip: {
    kicker: 'Explore Services',
    head: 'Technology Built Around Your Business.',
    lede: 'From enterprise systems and AI to dashboards and PropTech, bring the right technology into the processes, information and decisions that drive your organisation.',
    cta: 'Speak to an Expert',
    subs: [
      {
        name: 'Technology Consulting',
        slug: 'technology-consulting',
        cardText: 'Assess technology needs, identify transformation priorities and develop practical digital strategies aligned with business objectives.',
        figure: ['services/te-explore-technology-consulting.webp', 'new-folder/technology-ai-2.webp'],
      },
      {
        name: 'AI Solutions',
        slug: 'ai-solutions',
        cardText: 'Apply AI and intelligent automation to streamline workflows, improve productivity and unlock greater value from business data.',
        figure: ['services/te-explore-ai-solutions.webp', 'new-folder/services-4.webp'],
      },
      {
        name: 'ERP Dashboards',
        slug: 'erp-dashboards',
        cardText: 'Connect operational and financial information through dashboards that make performance, trends and key metrics easier to understand.',
        figure: ['services/te-explore-erp-dashboards.webp', 'new-folder/insights-2.webp'],
      },
      {
        name: 'PropTech',
        slug: 'proptech',
        cardText: 'Bring technology, data and automation into property operations, transactions and real estate decision-making.',
        figure: ['services/te-explore-proptech.webp', 'homepage/industry-2.webp'],
      },
      {
        name: 'Enterprise Solutions',
        slug: 'enterprise-solutions',
        cardText: 'Design and implement scalable technology solutions that connect systems, processes and information across the organisation.',
        figure: ['services/te-explore-enterprise-solutions.webp', 'new-folder/services-1.webp'],
      },
    ],
  },
  solution: {
    head: 'Find the Right Technology Solution',
    /* The document writes the tab names in capitals; they are set in title
       case here because the tab strip renders what it is given and every
       other label on the page is title case. Each tab's steps have lines of
       their own, so they are items rather than slugs. The conversation leads
       to the consultation; the two "Explore" buttons lead to the sub-service
       their tab is about. */
    tabs: [
      {
        tab: 'Transform & Connect',
        title: 'Build Technology Around Your Business.',
        intro: 'Create a more connected technology environment aligned with how your organisation operates today and where it needs to go next.',
        items: [
          { name: 'Technology Consulting', text: 'Define technology priorities, identify gaps and build a practical roadmap for transformation.' },
          { name: 'Enterprise Solutions', text: 'Connect systems, processes and business functions through scalable enterprise technology.' },
          { name: 'PropTech', text: 'Apply technology and automation across property operations, transactions and real estate workflows.' },
        ],
        cta: { label: 'Discuss Your Technology Needs', href: '/free-consultation/' },
      },
      {
        tab: 'AI & Automation',
        title: 'Put AI to Work Where It Matters.',
        intro: 'Bring AI and automation into the processes where they can simplify work, improve efficiency and create measurable business value.',
        items: [
          { name: 'AI Solutions', text: 'Apply AI to business processes, workflows and information to solve practical operational challenges.' },
          { name: 'Intelligent Automation', text: 'Automate repetitive processes and reduce manual intervention across everyday operations.' },
          { name: 'Process Optimisation', text: 'Redesign workflows around technology to make operations more efficient and connected.' },
        ],
        cta: { label: 'Explore AI Solutions', href: '/services/technology-data-ai/ai-solutions/' },
      },
      {
        tab: 'Data & Performance',
        title: 'Turn Business Data Into Business Visibility.',
        intro: 'Connect financial and operational information to create a clearer, more timely view of performance across the organisation.',
        items: [
          { name: 'ERP Dashboards', text: 'Bring critical financial and operational metrics together in focused, accessible dashboards.' },
          { name: 'Data Visibility', text: 'Create a connected view of information across systems, teams and business functions.' },
          { name: 'Performance Intelligence', text: 'Translate business data into meaningful insight for planning, monitoring and management.' },
        ],
        cta: { label: 'Explore Data Solutions', href: '/services/technology-data-ai/erp-dashboards/' },
      },
    ],
    images: [['new-folder/technology-ai-2.webp'], ['new-folder/services-4.webp'], ['homepage/industry-2.webp']],
  },
  banner: {
    head: 'Turn Technology Into Business Advantage.',
    body: 'Bring systems, data and AI together to create more connected, efficient operations.',
    cta: { label: 'Start Your Transformation', href: '/free-consultation/' },
    image: ['services/technology-banner.webp', 'banners/uae-slider-4.webp'],
  },
  related: {
    head: 'Explore Related Services',
    slugs: ['accounting-tax-services', 'research-intelligence', 'real-estate-transactions'],
  },
  close: {
    head: 'Make Technology Your Next Advantage.',
    lede: 'Turn systems, automation and data into capabilities that strengthen how your organisation operates and grows.',
    primary: { label: 'Speak to an Advisor', href: '/free-consultation/' },
    image: ['services/technology-talk.webp', 'new-folder/technology-ai-1.webp'],
  },
};
