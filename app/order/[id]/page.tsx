import OrderDetailsPageClient from "@/components/OrderDetailsPageClient";

interface OrderSharePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; fromBill?: string }>;
}

export default async function OrderSharePage({ params, searchParams }: OrderSharePageProps) {
  const { id } = await params;
  const { token, fromBill } = await searchParams;
  return (
    <OrderDetailsPageClient
      orderId={id}
      shareToken={token ?? ""}
      fromBillId={fromBill ?? null}
    />
  );
}
