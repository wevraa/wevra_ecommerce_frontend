import BillDetailsPageClient from "@/components/BillDetailsPageClient";

interface BillSharePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function BillSharePage({ params, searchParams }: BillSharePageProps) {
  const { id } = await params;
  const { token } = await searchParams;
  return <BillDetailsPageClient billId={id} shareToken={token ?? ""} />;
}
