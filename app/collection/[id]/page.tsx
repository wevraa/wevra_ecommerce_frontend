import CollectionHeader from "@/components/CollectionHeader";
import CollectionPageClient from "@/components/CollectionPageClient";
import BottomNav from "@/components/BottomNav";

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;

  return (
    <>
      <CollectionHeader />
      <main className="main-with-bottom-nav">
        <CollectionPageClient id={id} />
      </main>
      <BottomNav />
    </>
  );
}
