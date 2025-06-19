import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/sections/hero-section'
import { SearchSection } from '@/components/sections/search-section'
import { CategoriesSection } from '@/components/sections/categories-section'
import { FeaturedListings } from '@/components/sections/featured-listings'
import { StatsSection } from '@/components/sections/stats-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CTASection } from '@/components/sections/cta-section'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        {/* <SearchSection /> */}
        <CategoriesSection />
        <FeaturedListings />  
        {/* <StatsSection /> */}
        {/* <TestimonialsSection /> */}
        <CTASection />
      </main>
      <Footer />
    </>
  )
}