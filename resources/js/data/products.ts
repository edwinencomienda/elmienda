export type Product = {
    id: string;
    name: string;
    price: number;
    tag: string;
    image: string;
};

/**
 * Placeholder catalog. Photos are free-license stock from Unsplash,
 * stored in public/images/products — swap them for real product shots.
 */
export const products: Product[] = [
    {
        id: 'floral-art-print',
        name: 'Floral Art Print',
        price: 350,
        tag: 'Prints',
        image: '/images/products/floral-art-print.jpg',
    },
    {
        id: 'sticker-pack-pastels',
        name: 'Sticker Pack — Pastels',
        price: 180,
        tag: 'Stickers',
        image: '/images/products/sticker-pack-pastels.jpg',
    },
    {
        id: 'greeting-card-set',
        name: 'Greeting Card Set',
        price: 250,
        tag: 'Cards',
        image: '/images/products/greeting-card-set.jpg',
    },
    {
        id: 'canvas-tote-bag',
        name: 'Canvas Tote Bag',
        price: 480,
        tag: 'Gifts',
        image: '/images/products/canvas-tote-bag.jpg',
    },
    {
        id: 'botanical-print-a4',
        name: 'Botanical Print A4',
        price: 320,
        tag: 'Prints',
        image: '/images/products/botanical-print-a4.jpg',
    },
    {
        id: 'macrame-keychain',
        name: 'Macramé Keychain',
        price: 150,
        tag: 'Gifts',
        image: '/images/products/handmade-keychain.jpg',
    },
    {
        id: 'mini-notebook',
        name: 'Mini Notebook',
        price: 220,
        tag: 'Gifts',
        image: '/images/products/mini-notebook.jpg',
    },
    {
        id: 'custom-name-print',
        name: 'Custom Name Print',
        price: 400,
        tag: 'Prints',
        image: '/images/products/custom-name-print.jpg',
    },
];

export const productGallery = [
    products[0].image,
    '/images/products/gallery-2.jpg',
    '/images/products/gallery-3.jpg',
    '/images/products/gallery-4.jpg',
];

export const categories = ['All', 'Prints', 'Stickers', 'Cards', 'Gifts'];
