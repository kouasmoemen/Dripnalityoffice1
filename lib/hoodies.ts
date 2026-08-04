export type Hoodie = {
  id: 'black-signature-zip' | 'brown-archive-zip';
  serial: string;
  name: string;
  price: number;
  color: string;
  listingImage: string;
  gallery: string[];
  description: string;
};

export const hoodies: Hoodie[] = [
  {
    id: 'black-signature-zip',
    serial: 'DRP-HZ-001',
    name: 'Black Signature Zip Hoodie',
    price: 100,
    color: 'Black',
    listingImage: '/ds black1.jpg',
    gallery: ['/hoodie-black-artwork.jpg', '/ds black1.jpg', '/ds black2.jpg', '/ds black3.jpg', '/ds black4.jpg', '/ds black5.jpg', '/ds black6.jpg', '/ds black7.jpg', '/ds black8.jpg'],
    description: 'A heavyweight black zip hoodie with a structured double-layered hood and a quiet, precise silhouette.',
  },
  {
    id: 'brown-archive-zip',
    serial: 'DRP-HZ-002',
    name: 'Brown Archive Zip Hoodie',
    price: 100,
    color: 'Brown',
    listingImage: '/ds brown1.jpg',
    gallery: ['/hoodie-brown-artwork.jpg', '/ds brown1.jpg', '/ds brown2.jpg', '/ds brown3.jpg', '/ds brown4.jpg', '/ds brown5.jpg', '/ds brown6.jpg', '/ds brown7.jpg', '/ds brown8.jpg'],
    description: 'A dense French-terry archive zip in brown, built to wear in and remain intentional.',
  },
];
