"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAccessoryOptions,
  type ApiAccessoryOption,
} from "@/lib/api";
import type { AddonsNavParams } from "@/lib/addonsNavigation";
import { getAddonsReturnHref } from "@/lib/addonsNavigation";
import type { OrderAddon } from "@/lib/stores/boutiquesSelectionStore";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import { navigateBack } from "@/lib/navigateBack";
import styles from "./AddonsForm.module.scss";

type GarmentView = "back" | "front" | "side";

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

function buildAddonsPayload(
  options: ApiAccessoryOption[],
  selected: Record<string, boolean>,
  selectedSubs: Record<string, string[]>
): OrderAddon[] {
  const addons: OrderAddon[] = [];
  for (const opt of options) {
    if (!selected[opt.id]) continue;
    const subs = (opt.subOptions ?? []).slice().sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    if (subs.length === 0) {
      addons.push({ optionName: opt.name, subOptionName: opt.name });
      continue;
    }
    const picked = selectedSubs[opt.id] ?? [];
    for (const subId of picked) {
      const sub = subs.find((s) => s.id === subId);
      if (sub) {
        addons.push({ optionName: opt.name, subOptionName: sub.name });
      }
    }
  }
  return addons;
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
  const [accessoryOptions, setAccessoryOptions] = useState<ApiAccessoryOption[]>(
    []
  );
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  /** Selected sub-option ids keyed by parent accessory option id. */
  const [selectedSubs, setSelectedSubs] = useState<Record<string, string[]>>({});
  const [loaded, setLoaded] = useState(false);
  /** Hangings / drawing use front view slots (Back/Front/Side is only for Zip/Hooks). */
  const activeView: GarmentView = "front";

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
    let cancelled = false;
    getAccessoryOptions()
      .then((options) => {
        if (cancelled) return;
        setAccessoryOptions(options);

        const saved = useBoutiquesSelectionStore.getState().orderContext.addons ?? [];
        const nextSelected: Record<string, boolean> = {};
        const nextSubs: Record<string, string[]> = {};

        for (const opt of options) {
          const related = saved.filter((a) => a.optionName === opt.name);
          const subs = opt.subOptions ?? [];
          if (subs.length > 0) {
            const matchedIds = related
              .map((a) => subs.find((s) => s.name === a.subOptionName)?.id)
              .filter((id): id is string => Boolean(id));
            nextSelected[opt.id] = matchedIds.length > 0 || related.length > 0;
            nextSubs[opt.id] =
              matchedIds.length > 0
                ? matchedIds
                : related.length > 0
                  ? [subs[0].id]
                  : [];
          } else {
            nextSelected[opt.id] = related.length > 0;
            nextSubs[opt.id] = [];
          }
        }

        setSelected(nextSelected);
        setSelectedSubs(nextSubs);
      })
      .catch(() => {
        if (!cancelled) setAccessoryOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addonsPayload = useMemo(
    () => buildAddonsPayload(accessoryOptions, selected, selectedSubs),
    [accessoryOptions, selected, selectedSubs]
  );

  useEffect(() => {
    if (!loaded) return;
    setOrderContext({
      hasAddonsSelected: addonsPayload.length > 0,
      addons: addonsPayload,
    });
  }, [addonsPayload, loaded, setOrderContext]);

  const hangingSlotId = `hanging-${activeView}`;
  const drawingSlotId = `drawing-${activeView}`;
  const hangingImage = selectedImageByProductAndSlot.global?.[hangingSlotId] ?? null;
  const drawingImage = selectedImageByProductAndSlot.global?.[drawingSlotId] ?? null;

  const toggleOption = (opt: ApiAccessoryOption) => {
    const nextOn = !selected[opt.id];
    setSelected((prev) => ({ ...prev, [opt.id]: nextOn }));
    setSelectedSubs((prev) => {
      const subs = opt.subOptions ?? [];
      if (!nextOn) return { ...prev, [opt.id]: [] };
      if (subs.length === 0) return { ...prev, [opt.id]: [] };
      // Turning on with sub-options: keep existing picks or default to first
      const existing = prev[opt.id] ?? [];
      if (existing.length > 0) return prev;
      return { ...prev, [opt.id]: [subs[0].id] };
    });
  };

  const selectSubOption = (optionId: string, subId: string) => {
    setSelectedSubs((prev) => ({ ...prev, [optionId]: [subId] }));
    setSelected((prev) => ({ ...prev, [optionId]: true }));
  };

  const handleContinueToOrder = () => {
    const addons = buildAddonsPayload(accessoryOptions, selected, selectedSubs);
    setOrderContext({
      hasAddonsSelected: addons.length > 0,
      addons,
    });

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
          accessoryOptions.map((option) => {
            const isOn = !!selected[option.id];
            const subs = option.subOptions ?? [];
            const picked = selectedSubs[option.id] ?? [];
            return (
              <div key={option.id} className={styles.optionBlock}>
                <div className={styles.row}>
                  <span className={styles.label}>{option.name}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    className={`${styles.toggle} ${isOn ? styles.on : ""}`}
                    onClick={() => toggleOption(option)}
                  >
                    <span className={styles.toggleKnob} />
                  </button>
                </div>
                {isOn && subs.length > 0 ? (
                  <div className={styles.subSegmentWrap}>
                    <div
                      className={styles.subSegment}
                      role="tablist"
                      aria-label={`${option.name} options`}
                    >
                      {subs.map((sub) => {
                        const active = picked.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            className={`${styles.subSegmentBtn} ${
                              active ? styles.subSegmentBtnSelected : ""
                            }`}
                            onClick={() => selectSubOption(option.id, sub.id)}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}

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
