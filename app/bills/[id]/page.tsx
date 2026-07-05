import BillDetailsPageClient from "@/components/BillDetailsPageClient";

interface BillDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;
  return <BillDetailsPageClient billId={id} />;
}
