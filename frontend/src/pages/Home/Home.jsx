import { Box } from '@mui/material';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSection from './components/HeroSection';
import WelcomeOfferBanner from './components/WelcomeOfferBanner';
import SpecialOffersSection from './components/SpecialOffersSection';
import FeaturesSection from './components/FeaturesSection';
import StatsPreviewSection from './components/StatsPreviewSection';
import MediaShowcaseSlider from './components/MediaShowcaseSlider';
import WorkoutVideosSection from './components/WorkoutVideosSection';
import PartnersSection from './components/PartnersSection';
import HowItWorksSection from './components/HowItWorksSection';
import CtaSection from './components/CtaSection';
import SEO from '../../components/SEO';

export default function Home() {
  return (
    <>
      <SEO
        title="Track Your Strength. Build Your Best Self."
        description="GymPilot is the premier workout, strength tracking, and fitness ecosystem in Tunisia. Log exercises, hit PRs, shop authentic gear, and unlock free memberships with reward points."
        keywords="workout tracker, fitness tracker, strength training, progressive overload, workout log, gym app, body measurements, personal records, fitness shop tunisia, gym gear"
        path="/"
      />
      <Navbar />
      <Box
        component="main"
        sx={{
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
        }}
      >
        <HeroSection />
        <WelcomeOfferBanner />
        <SpecialOffersSection />
        <FeaturesSection />
        <StatsPreviewSection />
        <MediaShowcaseSlider />
        <WorkoutVideosSection />
        <PartnersSection />
        <HowItWorksSection />
        <CtaSection />
      </Box>
      <Footer />
    </>
  );
}

