'use client';

export type BagItem = {
  productId: string;
  size: 'S' | 'M' | 'L';
  quantity: number;
};

const BAG_KEY = 'dripnality_bag';
const SAVED_KEY = 'dripnality_saved_products';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '');
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function notifyBag() {
  window.dispatchEvent(new CustomEvent('dripnality:bag-updated'));
}

export function getBag(): BagItem[] {
  const items = readJson<unknown[]>(BAG_KEY, []);
  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Partial<BagItem>;
    if (candidate.productId !== 'drp-ts-003' || !['S', 'M', 'L'].includes(candidate.size || '')) return [];
    return [{ productId: candidate.productId, size: candidate.size as BagItem['size'], quantity: Math.max(1, Math.min(10, Number(candidate.quantity) || 1)) }];
  });
}

export function saveBag(items: BagItem[]) {
  window.localStorage.setItem(BAG_KEY, JSON.stringify(items));
  notifyBag();
}

export function addTshirtToBag(size: BagItem['size']) {
  const bag = getBag();
  const existing = bag.find((item) => item.productId === 'drp-ts-003' && item.size === size);
  if (existing) existing.quantity = Math.min(10, existing.quantity + 1);
  else bag.push({ productId: 'drp-ts-003', size, quantity: 1 });
  saveBag(bag);
  return bag;
}

export function bagCount() {
  return getBag().reduce((total, item) => total + item.quantity, 0);
}

export function getSavedProducts() {
  const products = readJson<unknown[]>(SAVED_KEY, []);
  return products.filter((item): item is string => typeof item === 'string');
}

export function isProductSaved(productId: string) {
  return getSavedProducts().includes(productId);
}

export function setProductSaved(productId: string, shouldSave: boolean) {
  const products = new Set(getSavedProducts());
  if (shouldSave) products.add(productId);
  else products.delete(productId);
  window.localStorage.setItem(SAVED_KEY, JSON.stringify([...products]));
}
