"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiAccessoryOption } from "@/lib/api";
import type { AddonsNavParams } from "@/lib/addonsNavigation";
import { getAddonsReturnHref } from "@/lib/addonsNavigation";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import { navigateBack } from "@/lib/navigateBack";
import styles from "./AddonsForm.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

type GarmentView = "back" | "front" | "side";

const VIEWS: { key: GarmentView; label: string }[] = [
  { key: "back", label: "Back" },
  { key: "front", label: "Front" },
  { key: "side", label: "Side" },
];

function buildReferenceHref(
  path: "/addons/hangings" | "/addons/drawing",
  view: GarmentView,
  nav: AddonsNavParams
): string {
  const params = new URLSearchParams();
  params.set("view", view);
  if (nav.returnTo) params.set("returnTo", nav.returnTo);
  if (nav.productId) params.set("productId", nav.productId);
  if (nav.productImage) params.set("image", nav.productImage);
  if (nav.boutiqueId) params.set("boutiqueId", nav.boutiqueId);
  return `${path}?${params.toString()}`;
}

export default function AddonsForm({
  productId: productIdFromUrl,
  productImage: productImageFromUrl,
  returnTo,
  boutiqueId,
}: AddonsNavParams) {
  const router = useRouter();
  const orderContext = useBoutiquesSelectionStore((s) => s.orderContext);
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);
  const selectedImageByProductAndSlot = useBoutiqueOrderStore(
    (s) => s.selectedImageByProductAndSlot
  );
  const [accessoryOptions, setAccessoryOptions] = useState<ApiAccessoryOption[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [activeView, setActiveView] = useState<GarmentView>("front");

  const navParams: AddonsNavParams = {
    returnTo,
    productId: productIdFromUrl ?? orderContext.productId,
    productImage: productImageFromUrl ?? orderContext.productImage,
    boutiqueId,
  };

  useEffect(() => {
    if (productIdFromUrl || productImageFromUrl) {
      setOrderContext({
        productId: productIdFromUrl,
        productImage: productImageFromUrl,
      });
    }
  }, [productIdFromUrl, productImageFromUrl, setOrderContext]);

  useEffect(() => {
    const hasAny = Object.values(selected).some(Boolean);
    const addons = accessoryOptions
      .filter((opt) => selected[opt.id])
      .map((opt) => ({
        optionName: opt.name,
        subOptionName: opt.name,
      }));
    setOrderContext({ hasAddonsSelected: hasAny, addons });
  }, [selected, accessoryOptions, setOrderContext]);

  useEffect(() => {
    if (!API_BASE) {
      setLoaded(true);
      return;
    }
    fetch(`${API_BASE}/v1/addon/accessory-options`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: unknown) => {
        const raw = Array.isArray(json) ? json : (json as { data?: unknown[] })?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];
        const options: ApiAccessoryOption[] = list
          .map((item: unknown, index: number) => {
            const o = item as Record<string, unknown>;
            const id = typeof o.id === "string" ? o.id : `opt-${index}`;
            const name = typeof o.name === "string" ? o.name : "";
            return { id, name };
          })
          .filter((o) => o.name);
        setAccessoryOptions(options);
        setSelected((prev) => {
          const savedNames = new Set(
            useBoutiquesSelectionStore.getState().orderContext.addons?.map((a) => a.optionName) ??
              []
          );
          const next = { ...prev };
          for (const opt of options) {
            if (next[opt.id] === undefined) {
              next[opt.id] = savedNames.has(opt.name);
            }
          }
          return next;
        });
      })
      .catch(() => setAccessoryOptions([]))
      .finally(() => setLoaded(true));
  }, []);

  const hangingSlotId = `hanging-${activeView}`;
  const drawingSlotId = `drawing-${activeView}`;
  const hangingImage = selectedImageByProductAndSlot.global?.[hangingSlotId] ?? null;
  const drawingImage = selectedImageByProductAndSlot.global?.[drawingSlotId] ?? null;

  const handleContinueToOrder = () => {
    const hasAny = Object.values(selected).some(Boolean);
    const addons = accessoryOptions
      .filter((opt) => selected[opt.id])
      .map((opt) => ({
        optionName: opt.name,
        subOptionName: opt.name,
      }));
    setOrderContext({ hasAddonsSelected: hasAny, addons });

    const productId = orderContext.productId ?? productIdFromUrl;
    const productImage = orderContext.productImage ?? productImageFromUrl;
    navigateBack(
      router,
      getAddonsReturnHref({
        returnTo: returnTo ?? "select-boutiques",
        productId,
        productImage,
        boutiqueId,
      })
    );
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <p className={styles.intro}>Select Which you required</p>

        {loaded && accessoryOptions.length === 0 ? (
          <p className={styles.intro}>No accessory options available.</p>
        ) : null}
        {!loaded ? (
          <p className={styles.intro}>Loading accessory options…</p>
        ) : (
          accessoryOptions.map((option) => (
            <div key={option.id} className={styles.row}>
              <span className={styles.label}>{option.name}</span>
              <button
                type="button"
                role="switch"
                aria-checked={!!selected[option.id]}
                className={`${styles.toggle} ${selected[option.id] ? styles.on : ""}`}
                onClick={() =>
                  setSelected((prev) => ({ ...prev, [option.id]: !prev[option.id] }))
                }
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))
        )}

        <div className={styles.segmentWrap}>
          <div className={styles.segment} role="tablist" aria-label="Garment view">
            {VIEWS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeView === key}
                className={`${styles.segmentBtn} ${activeView === key ? styles.selected : ""}`}
                onClick={() => setActiveView(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.twoCol}>
          <div>
            <h2 className={styles.sectionTitle}>HANGINGS</h2>
            <p className={styles.subtitle}>
              Select or upload hangings or else leave blank
            </p>
            <button
              type="button"
              className={`${styles.uploadCard} ${styles.uploadCardButton}`}
              onClick={() =>
                router.push(buildReferenceHref("/addons/hangings", activeView, navParams))
              }
              aria-label={`Select hanging design for ${activeView} view`}
            >
              {hangingImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hangingImage}
                  alt={`Hanging preview (${activeView})`}
                  className={styles.uploadPreview}
                />
              ) : (
                <span className={styles.uploadPlus} aria-hidden>
                  +
                </span>
              )}
            </button>
          </div>

          <div>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleMuted}`}>
              DRAWING IMAGE
            </h2>
            <p className={styles.subtitle}>
              Upload your drawing pattern if required
            </p>
            <button
              type="button"
              className={`${styles.uploadCard} ${styles.uploadCardButton}`}
              onClick={() =>
                router.push(buildReferenceHref("/addons/drawing", activeView, navParams))
              }
              aria-label={`Select drawing image for ${activeView} view`}
            >
              {drawingImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={drawingImage}
                  alt={`Drawing preview (${activeView})`}
                  className={styles.uploadPreview}
                />
              ) : (
                <span className={styles.uploadPlus} aria-hidden>
                  +
                </span>
              )}
            </button>
          </div>
        </div>

        <button type="button" className={styles.cta} onClick={handleContinueToOrder}>
          CONTINUE TO ORDER
        </button>
      </div>
    </div>
  );
}
