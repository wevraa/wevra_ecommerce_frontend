import AddonsHeader from "@/components/AddonsHeader";
import AddonsForm from "@/components/AddonsForm";
import BottomNav from "@/components/BottomNav";
import type { AddonsReturnTo } from "@/lib/addonsNavigation";

interface AddonsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

function pickParam(
  sp: { [key: string]: string | string[] | undefined },
  key: string
): string | undefined {
  const raw = sp[key];
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0];
  return undefined;
}

export default async function AddonsPage({ searchParams }: AddonsPageProps) {
  const sp = searchParams ? await searchParams : {};
  const productId = pickParam(sp, "productId");
  const productImage = pickParam(sp, "image");
  const boutiqueId = pickParam(sp, "boutiqueId");
  const rawReturnTo = pickParam(sp, "returnTo");
  const returnTo: AddonsReturnTo | undefined =
    rawReturnTo === "order-quote" || rawReturnTo === "select-boutiques"
      ? rawReturnTo
      : undefined;

  const navParams = { returnTo, productId, productImage, boutiqueId };

  return (
    <>
      <AddonsHeader {...navParams} />
      <main className="main-with-bottom-nav">
        <AddonsForm {...navParams} />
      </main>
      <BottomNav />
    </>
  );
}
