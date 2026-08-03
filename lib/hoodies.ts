import type { Product } from '../components/QuickView';

export const hoodieProducts: Product[] = [
  {
    id: 'black-signature-zip',
    name: 'Black Signature Zip Hoodie',
    price: 100,
    color: 'Black',
    image: '/hoodie-black-artwork.jpg',
    listingImage: '/ds black1.jpg',
    hoverImage: '/ds black1.jpg',
    gallery: ['/hoodie-black-artwork.jpg', '/don1black.png', '/ds black1.jpg', '/ds black2.jpg', '/ds black3.jpg', '/ds black4.jpg', '/ds black5.jpg', '/ds black6.jpg', '/ds black7.jpg', '/ds black8.jpg'],
    description: 'Heavyweight French terry zip hoodie with a structured double-layered hood, custom hardware and a washed black finish.',
    soldOut: true,
    sizes: ['S', 'M', 'L'],
    serial: 'DRP-HZ-001',
  },
  {
    id: 'brown-archive-zip',
    name: 'Brown Archive Zip Hoodie',
    price: 100,
    color: 'Brown',
    image: '/hoodie-brown-artwork.jpg',
    listingImage: '/ds brown1.jpg',
    hoverVideo: '/vid brown1.mp4',
    gallery: ['/hoodie-brown-artwork.jpg', '/don2brown.png', '/ds brown1.jpg', '/ds brown2.jpg', '/ds brown3.jpg', '/ds brown4.jpg', '/ds brown5.jpg', '/ds brown6.jpg', '/ds brown7.jpg', '/ds brown8.jpg'],
    description: 'Pigment-dyed archive zip hoodie cut from dense French terry, finished with an intentionally lived-in surface.',
    soldOut: true,
    sizes: ['S', 'M', 'L'],
    serial: 'DRP-HZ-002',
  },
];
