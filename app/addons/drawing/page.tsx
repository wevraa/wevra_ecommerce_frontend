"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import ReferenceImageSelectPage, {
  type ReferenceView,
} from "@/components/ReferenceImageSelectPage";
import { buildAddonsHref } from "@/lib/addonsNavigation";
import type { AddonsReturnTo } from "@/lib/addonsNavigation";

function DrawingInner() {
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") as ReferenceView | null) ?? "front";
  const productId = searchParams.get("productId") ?? undefined;
  const productImage = searchParams.get("image") ?? undefined;
  const boutiqueId = searchParams.get("boutiqueId") ?? undefined;
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo: AddonsReturnTo | undefined =
    rawReturnTo === "order-quote" || rawReturnTo === "select-boutiques"
      ? rawReturnTo
      : undefined;

  const returnHref = buildAddonsHref({
    returnTo,
    productId,
    productImage,
    boutiqueId,
  });

  return (
    <>
      <ReferenceImageSelectPage
        type="DRAWING"
        view={view === "back" || view === "side" ? view : "front"}
        returnHref={returnHref}
      />
      <BottomNav />
    </>
  );
}

export default function AddonsDrawingPage() {
  return (
    <Suspense fallback={null}>
      <DrawingInner />
    </Suspense>
  );
}
