import ProductDetailHeader from "@/components/ProductDetailHeader";
import ProductDetailClient from "@/components/ProductDetailClient";
import BottomNav from "@/components/BottomNav";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  return (
    <>
      <ProductDetailHeader />
      <main className="main-with-bottom-nav">
        <ProductDetailClient id={id} />
      </main>
      <BottomNav />
    </>
  );
}
