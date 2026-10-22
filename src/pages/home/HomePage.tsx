import { Hero } from '../../widgets/hero';
import { IncludesSection } from '../../widgets/includes-section';
import { IncludesDetail } from '../../widgets/includes-detail';
import { PricingSection } from '../../widgets/pricing-section';
import { FaqSection } from '../../widgets/faq-section';
import { ClosingCta } from '../../widgets/closing-cta';

export function HomePage() {
  return (
    <>
      <Hero />
      <IncludesSection />
      <PricingSection />
      <IncludesDetail />
      <FaqSection variant="home" />
      <ClosingCta />
    </>
  );
}
