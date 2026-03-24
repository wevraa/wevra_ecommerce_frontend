import SelectSleeveDesignHeader from "@/components/SelectSleeveDesignHeader";
import SelectSleeveDesignContent from "@/components/SelectSleeveDesignContent";
import BottomNav from "@/components/BottomNav";

interface SelectSleeveDesignPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SelectSleeveDesignPage({
  searchParams,
}: SelectSleeveDesignPageProps) {
  const sp = searchParams ? await searchParams : {};
  const productId =
    typeof sp.productId === "string" ? sp.productId : undefined;
  const returnImage =
    typeof sp.image === "string" ? sp.image : undefined;

  return (
    <>
      <SelectSleeveDesignHeader productId={productId} returnImage={returnImage} />
      <main className="main-with-bottom-nav">
        <SelectSleeveDesignContent productId={productId} returnImage={returnImage} />
      </main>
      <BottomNav />
    </>
  );
}
