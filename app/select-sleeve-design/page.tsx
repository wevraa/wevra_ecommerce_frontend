"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SelectSleeveDesignHeader from "@/components/SelectSleeveDesignHeader";
import SelectSleeveDesignContent from "@/components/SelectSleeveDesignContent";
import BottomNav from "@/components/BottomNav";

function SelectSleeveDesignInner() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") ?? undefined;
  const returnImage = searchParams.get("image") ?? undefined;
  const slotId = searchParams.get("slot") ?? undefined;
  const returnTo = searchParams.get("returnTo") ?? undefined;

  return (
    <>
      <SelectSleeveDesignHeader
        productId={productId}
        returnImage={returnImage}
        slotId={slotId}
        returnTo={returnTo}
      />
      <main className="main-with-bottom-nav">
        <SelectSleeveDesignContent
          productId={productId}
          returnImage={returnImage}
          slotId={slotId}
          returnTo={returnTo}
        />
      </main>
      <BottomNav />
    </>
  );
}

export default function SelectSleeveDesignPage() {
  return (
    <Suspense fallback={null}>
      <SelectSleeveDesignInner />
    </Suspense>
  );
}
