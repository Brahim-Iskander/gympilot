import { Box } from '@mui/material';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSection from './components/HeroSection';
import MediaShowcaseSlider from './components/MediaShowcaseSlider';
import PartnersSection from './components/PartnersSection';
import FeaturesSection from './components/FeaturesSection';
import WorkoutVideosSection from './components/WorkoutVideosSection';
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
        keywords="workout tracker, fitness tracker, strength training, progressive overload, workout log, gym app, body measurements, personal records, fitness coach"
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
        <MediaShowcaseSlider />
        <HeroSection />
        <PartnersSection />
        <FeaturesSection />
        <WorkoutVideosSection />
        <HowItWorksSection />
        <AdsSection />
        <CtaSection />
      </Box>
      <Footer />
    </>
  );
}

