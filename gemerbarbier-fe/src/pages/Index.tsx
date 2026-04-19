import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SectionDivider from "@/components/SectionDivider";
import About from "@/components/About";
import Services from "@/components/Services";
import Team from "@/components/Team";
import Gallery from "@/components/Gallery";
import Reviews from "@/components/Reviews";
import Reservation from "@/components/Reservation";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <SectionDivider />
      <About />
      <SectionDivider />
      <Services />
      <SectionDivider />
      <Team />
      <SectionDivider />
      <Gallery />
      <SectionDivider />
      <Reviews />
      <SectionDivider />
      <Reservation />
      <SectionDivider />
      <Contact />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
