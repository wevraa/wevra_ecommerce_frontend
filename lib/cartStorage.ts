import type { CartItem } from "@/data/dummy";

const DB_NAME = "wevraa_cart";
const DB_VERSION = 1;
const STORE_NAME = "cartItems";

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => void | T | Promise<T>
): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;

  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);

  const value = await Promise.resolve(fn(store));

  return new Promise<T | null>((resolve, reject) => {
    tx.oncomplete = () => resolve(value !== undefined ? (value as T) : null);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getCartItems(): Promise<CartItem[]> {
  const items = await withStore<CartItem[]>("readonly", (store) => {
    return new Promise<CartItem[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result as CartItem[]) ?? []);
      request.onerror = () => reject(request.error);
    });
  });
  return items ?? [];
}

export async function setCartItems(items: CartItem[]): Promise<void> {
  await withStore<void>("readwrite", (store) => {
    store.clear();
    for (const item of items) {
      store.put(item);
    }
  });
}

export async function addToCart(newItem: CartItem): Promise<void> {
  const items = await getCartItems();
  const existingIndex = items.findIndex(
    (i) => i.productId === newItem.productId && i.size === newItem.size
  );

  if (existingIndex >= 0) {
    const updated = [...items];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + newItem.quantity,
    };
    await setCartItems(updated);
  } else {
    const updated: CartItem[] = [
      ...items,
      {
        ...newItem,
        id: newItem.id || `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
    ];
    await setCartItems(updated);
  }
}

export async function updateCartItemQuantity(id: string, quantity: number): Promise<void> {
  const items = await getCartItems();
  const updated = items.map((i) => (i.id === id ? { ...i, quantity } : i));
  await setCartItems(updated);
}

export async function removeCartItem(id: string): Promise<void> {
  const items = await getCartItems();
  const updated = items.filter((i) => i.id !== id);
  await setCartItems(updated);
}

export async function clearCart(): Promise<void> {
  await setCartItems([]);
}

