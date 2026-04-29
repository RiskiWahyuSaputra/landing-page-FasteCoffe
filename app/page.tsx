import About from "@/components/About";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import SequenceScroll from "@/components/SequenceScroll";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";

export default function HomePage() {
  return (
    <main id="top" className="relative min-h-screen overflow-x-clip bg-page text-cream">
      <Navbar />
      <SequenceScroll />

      <div className="relative z-10 -mt-[100vh]">
        <About />
        <Menu />
        <Stats />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
