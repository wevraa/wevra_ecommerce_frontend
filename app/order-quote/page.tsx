import OrderQuotePageClient from "@/components/OrderQuotePageClient";
import BottomNav from "@/components/BottomNav";

interface OrderQuotePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderQuotePage({ searchParams }: OrderQuotePageProps) {
  const sp = searchParams ? await searchParams : {};
  const raw = sp.boutiqueId;
  const boutiqueId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  return (
    <>
      <OrderQuotePageClient boutiqueId={boutiqueId} />
      <BottomNav />
    </>
  );
}
