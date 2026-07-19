import { redirect } from "next/navigation";

interface OrderLegacyRedirectProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; fromBill?: string }>;
}

/** Legacy path — share links use `/order/:id?token=` */
export default async function OrderLegacyRedirect({ params, searchParams }: OrderLegacyRedirectProps) {
  const { id } = await params;
  const { token, fromBill } = await searchParams;
  const query = new URLSearchParams();
  if (token) query.set("token", token);
  if (fromBill) query.set("fromBill", fromBill);
  const qs = query.toString();
  redirect(`/order/${encodeURIComponent(id)}${qs ? `?${qs}` : ""}`);
}
