import OrderDetailsPageClient from "@/components/OrderDetailsPageClient";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailsPageClient orderId={id} />;
}
