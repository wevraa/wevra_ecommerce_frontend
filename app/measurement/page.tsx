import BottomNav from "@/components/BottomNav";
import MeasurementPageClient from "@/components/MeasurementPageClient";

interface MeasurementPageProps {
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

export default async function MeasurementPage({ searchParams }: MeasurementPageProps) {
  const sp = searchParams ? await searchParams : {};
  const subcategoryId = pickParam(sp, "subcategoryId");

  return (
    <>
      <MeasurementPageClient subcategoryIdFromUrl={subcategoryId} />
      <BottomNav />
    </>
  );
}
