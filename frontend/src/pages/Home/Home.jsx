import { Box } from '@mui/material';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSection from './components/HeroSection';
import PartnersSection from './components/PartnersSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import AdsSection from './components/AdsSection';
import CtaSection from './components/CtaSection';
import SEO from '../../components/SEO';

export default function Home() {
  return (
    <>
      <SEO
        title="Track Your Strength. Build Your Best Self."
        description="GymPilot is a free workout and strength tracking app. Log exercises, monitor progress, hit personal records, and stay consistent on your fitness journey."
        path="/"
      />
      <Navbar />
      <Box component="main" >
        <HeroSection />
        <PartnersSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AdsSection />
        <CtaSection />
      </Box>
      <Footer />
    </>
  );
}

