import { Hero } from '../../widgets/hero';
import { IncludesDetail } from '../../widgets/includes-detail';
import { PricingSection } from '../../widgets/pricing-section';
import { FaqSection } from '../../widgets/faq-section';
import { ClosingCta } from '../../widgets/closing-cta';

export function HomePage() {
  return (
    <>
      <Hero />
      <IncludesDetail />
      <PricingSection />
      <FaqSection variant="home" />
      <ClosingCta />
    </>
  );
}
