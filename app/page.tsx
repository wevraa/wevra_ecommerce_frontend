import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CategoryNav from "@/components/CategoryNav";
import HeroCarousel from "@/components/HeroCarousel";
import GoodDeals from "@/components/GoodDeals";
import SizeProductBlock from "@/components/SizeProductBlock";
import PlaceholderBanners from "@/components/PlaceholderBanners";
import FeaturedProducts from "@/components/FeaturedProducts";
import CustomerReviews from "@/components/CustomerReviews";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="main-with-bottom-nav">
        <CategoryNav />
        <HeroCarousel />
        <GoodDeals />
        {/* <SizeProductBlock /> */}
        {/* <PlaceholderBanners /> */}
        <FeaturedProducts />
        <CustomerReviews />
        <Footer />
      </main>
      <BottomNav />
    </>
  );
}
