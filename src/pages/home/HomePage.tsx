import { Hero } from '../../widgets/hero';
import { IncludesSection } from '../../widgets/includes-section';
import { CommunitySection } from '../../widgets/community-section';
import { PricingSection } from '../../widgets/pricing-section';
import { FaqSection } from '../../widgets/faq-section';
import { ClosingCta } from '../../widgets/closing-cta';

export function HomePage() {
  return (
    <>
      <Hero />
      <IncludesSection />
      <CommunitySection />
      <PricingSection />
      <FaqSection variant="home" />
      <ClosingCta />
    </>
  );
}
