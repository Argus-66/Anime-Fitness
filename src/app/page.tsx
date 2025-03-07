// src/app/page.tsx

import HeroSection from '@/components/landing/HeroSection';
import Navbar from '@/components/landing/Navbar';
import AboutSection from '@/components/landing/AboutSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import SupportSection from '@/components/landing/SupportSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-solo-dark">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <SupportSection />
      <Footer />
    </main>
  );
}
