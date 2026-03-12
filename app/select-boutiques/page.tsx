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
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function SelectBoutiquesPage({
  searchParams,
}: SelectBoutiquesPageProps) {
  const tailors = await getTailors();
  const selectedImageFromProduct =
    (searchParams?.image as string | undefined) ?? undefined;

  const images =
    selectedImageFromProduct && defaultSelectedImages.length > 0
      ? [
          {
            ...defaultSelectedImages[0],
            image: selectedImageFromProduct,
          },
          ...defaultSelectedImages.slice(1),
        ]
      : defaultSelectedImages;

  return (
    <>
      <SelectBoutiquesHeader />
      <main className="main-with-bottom-nav">
        <ProfileBlock profile={userProfile} />
        <OrderTypeSelect types={orderTypes} />
        <SelectedImages images={images} />
        <MeasurementAddonsRows />
        <AllBoutiques tailors={tailors} compact />
      </main>
      <BottomNav />
    </>
  );
}
