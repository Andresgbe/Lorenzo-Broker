import { Hero } from '../../widgets/hero';
import { CommunitySection } from '../../widgets/community-section';
import { IncludesSection } from '../../widgets/includes-section';
import { PricingSection } from '../../widgets/pricing-section';
import { FaqSection } from '../../widgets/faq-section';
import { ClosingCta } from '../../widgets/closing-cta';

export function HomePage() {
  return (
    <>
      <Hero />
      <CommunitySection />
      <IncludesSection />
      <PricingSection />
      <FaqSection />
      <ClosingCta />
    </>
  );
}
