import About from "@/components/About";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import { getPublicMenuItems } from "@/lib/laravel-admin-api";
import { fallbackMenuItems } from "@/lib/menu-fallback";

export default async function HomePage() {
  const menuItems = await getPublicMenuItems()
    .then((items) =>
      items.map((item) => ({
        name: item.name,
        description: item.description,
        price: item.formatted_price,
        accent: item.accent
      }))
    )
    .catch(() => fallbackMenuItems);

  return (
    <main id="top" className="relative min-h-screen overflow-x-clip bg-page text-cream">
      <Navbar />

      <div className="relative z-10">
        <About />
        <Menu menuItems={menuItems} />
        <Stats />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
