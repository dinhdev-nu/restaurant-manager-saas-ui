import { Navigation } from "./components/navigation"
import { HeroSection } from "./components/hero-section"
import { FlavorCarousel } from "./components/flavor-carousel"
import { BentoGrid } from "./components/bento-grid"
import { ActivationsSection } from "./components/activations-section"
import { SocialSection } from "./components/social-section"
import { Footer } from "./components/footer"
import ClickSpark from "./components/click-spark"
import { LenisProvider } from "./components/lenis-provider"
import "./home.css"

export default function Home() {
    return (
        <div className="font-sans antialiased">
            <ClickSpark
                sparkColor="#AFFF00"
                sparkSize={12}
                sparkRadius={20}
                sparkCount={8}
                duration={400}
                easing="ease-out"
            >
                <LenisProvider>
                    <main className="min-h-screen bg-background">
                        <Navigation />
                        <HeroSection />
                        <FlavorCarousel />
                        <BentoGrid />
                        <ActivationsSection />
                        <SocialSection />
                        <Footer />
                    </main>
                </LenisProvider>
            </ClickSpark>
        </div>
    )
}
