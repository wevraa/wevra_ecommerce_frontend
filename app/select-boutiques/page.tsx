import SelectBoutiquesHeader from "@/components/SelectBoutiquesHeader";
import ProfileBlock from "@/components/ProfileBlock";
import OrderTypeSelect from "@/components/OrderTypeSelect";
import SelectedImages from "@/components/SelectedImages";
import MeasurementAddonsRows from "@/components/MeasurementAddonsRows";
import AllBoutiques from "@/components/AllBoutiques";
import BottomNav from "@/components/BottomNav";
import { getTailors } from "@/lib/api";
import {
  userProfile,
  orderTypes,
  selectedImages as defaultSelectedImages,
} from "@/data/dummy";

interface SelectBoutiquesPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SelectBoutiquesPage({
  searchParams,
}: SelectBoutiquesPageProps) {
  const tailors = await getTailors();
  const sp = searchParams ? await searchParams : {};
  const raw = sp.image;
  const selectedImageFromProduct =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? raw[0]
        : undefined;

  const rawProductId = sp.productId;
  const productId =
    typeof rawProductId === "string"
      ? rawProductId
      : Array.isArray(rawProductId)
        ? rawProductId[0]
        : undefined;

  const images = defaultSelectedImages.map((item) =>
    item.id === "1" && selectedImageFromProduct
      ? { ...item, image: selectedImageFromProduct }
      : item
  );

  return (
    <>
      <SelectBoutiquesHeader />
      <main className="main-with-bottom-nav">
        <ProfileBlock profile={userProfile} />
        <OrderTypeSelect types={orderTypes} />
        <SelectedImages
          images={images}
          productId={productId}
          productImage={selectedImageFromProduct}
        />
        <MeasurementAddonsRows productId={productId} productImage={selectedImageFromProduct} />
        <AllBoutiques
          tailors={tailors}
          compact
          productId={productId}
          productImage={selectedImageFromProduct}
        />
      </main>
      <BottomNav />
    </>
  );
}
