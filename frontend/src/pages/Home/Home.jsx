import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSection from './components/HeroSection';
import PartnersSection from './components/PartnersSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import AdsSection from './components/AdsSection';
import CtaSection from './components/CtaSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main sx={{ pt: { xs: 64, md: 76 } }}>
        <HeroSection />
        <PartnersSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AdsSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
