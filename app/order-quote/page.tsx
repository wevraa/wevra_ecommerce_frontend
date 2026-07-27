import OrderQuotePageClient from "@/components/OrderQuotePageClient";
import BottomNav from "@/components/BottomNav";
import { getTailors } from "@/lib/api";

export default async function OrderQuotePage() {
  const tailors = await getTailors();

  return (
    <>
      <OrderQuotePageClient tailors={tailors} />
      <BottomNav />
    </>
  );
}
