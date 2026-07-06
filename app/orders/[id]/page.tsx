import { redirect } from "next/navigation";

interface OrderLegacyRedirectProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

/** Legacy path — share links use `/order/:id?token=` */
export default async function OrderLegacyRedirect({ params, searchParams }: OrderLegacyRedirectProps) {
  const { id } = await params;
  const { token } = await searchParams;
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  redirect(`/order/${encodeURIComponent(id)}${query}`);
}
