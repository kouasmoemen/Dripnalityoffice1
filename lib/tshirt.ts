export const tshirtProduct = {
  id: 'drp-ts-003',
  serial: 'DRP-TS-003',
  name: 'Dripnality’s Oversized Multi-Balaclavas White T-Shirt',
  price: 60,
  shipping: 8,
  cover: '/tshirt-drop/T12.jpeg',
  sizes: ['S', 'M', 'L'],
} as const;

// T0 is intentionally excluded from the public product story.
export const tshirtGallery = Array.from({ length: 15 }, (_, index) => `/tshirt-drop/T${index + 1}.jpeg`);
