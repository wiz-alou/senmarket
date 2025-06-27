import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/sections/hero-section'
import { CategoriesSection } from '@/components/sections/categories-section'
import { FeaturedListings } from '@/components/sections/featured-listings'
import { CTASection } from '@/components/sections/cta-section'
import { PhasesMarketingSection } from '@/components/sections/phases-marketing-section' // 🆕

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PhasesMarketingSection /> {/* 🆕 Nouvelle section */}
        <CategoriesSection />
        <FeaturedListings />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}