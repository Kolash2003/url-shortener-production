import Hero from "@/components/landing/Hero";
import StatsStrip from "@/components/landing/StatsStrip";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <StatsStrip />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
