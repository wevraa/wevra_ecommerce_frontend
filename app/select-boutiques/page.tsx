import SelectBoutiquesHeader from "@/components/SelectBoutiquesHeader";
import ProfileBlock from "@/components/ProfileBlock";
import OrderTypeSelect from "@/components/OrderTypeSelect";
import SelectedImages from "@/components/SelectedImages";
import MeasurementAddonsRows from "@/components/MeasurementAddonsRows";
import SelectBoutiquesActions from "@/components/SelectBoutiquesActions";
import OrderParamsSync from "@/components/OrderParamsSync";
import BottomNav from "@/components/BottomNav";
import {
  getTailorCategories,
  getTailorCategoriesTree,
} from "@/lib/api";
import styles from "./select-boutiques.module.scss";

interface SelectBoutiquesPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SelectBoutiquesPage({
  searchParams,
}: SelectBoutiquesPageProps) {
  const [categories, tree] = await Promise.all([
    getTailorCategories(),
    getTailorCategoriesTree(),
  ]);

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

  return (
    <div className={styles.page}>
      <OrderParamsSync
        productId={productId}
        productImage={selectedImageFromProduct}
      />
      <SelectBoutiquesHeader />
      <main className={`main-with-bottom-nav ${styles.main}`}>
        <ProfileBlock />
        <OrderTypeSelect categories={categories} tree={tree} />
        <SelectedImages
          productId={productId}
          productImage={selectedImageFromProduct}
        />
        <MeasurementAddonsRows
          productId={productId}
          productImage={selectedImageFromProduct}
        />
        <SelectBoutiquesActions
          productId={productId}
          productImage={selectedImageFromProduct}
        />
      </main>
      <BottomNav />
    </div>
  );
}
