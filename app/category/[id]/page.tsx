import CollectionHeader from "@/components/CollectionHeader";
import CategoryPageClient from "@/components/CategoryPageClient";
import BottomNav from "@/components/BottomNav";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;

  return (
    <>
      <CollectionHeader label="Category" />
      <main className="main-with-bottom-nav">
        <CategoryPageClient id={id} />
      </main>
      <BottomNav />
    </>
  );
}
