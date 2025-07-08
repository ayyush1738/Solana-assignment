import { HeroSection } from '@/components/sections/hero-section';
import { FeatureSection } from '@/components/sections/feature-section';
import { CTASection } from '@/components/sections/cta-section';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}