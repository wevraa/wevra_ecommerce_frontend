import { redirect } from "next/navigation";

interface BillLegacyRedirectProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

/** Legacy path — share links use `/bill/:id?token=` */
export default async function BillLegacyRedirect({ params, searchParams }: BillLegacyRedirectProps) {
  const { id } = await params;
  const { token } = await searchParams;
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  redirect(`/bill/${encodeURIComponent(id)}${query}`);
}
