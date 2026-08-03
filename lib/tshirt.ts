export const tshirtProduct = {
  id: 'drp-ts-003',
  serial: 'DRP-TS-003',
  name: 'Dripnality’s Oversized Multi-Balaclavas White T-Shirt',
  price: 60,
  shipping: 8,
  cover: '/tshirt-drop/T12.jpeg',
  sizes: ['S', 'M', 'L'],
} as const;

export const tshirtGallery = Array.from({ length: 16 }, (_, index) => `/tshirt-drop/T${index}.jpeg`);
