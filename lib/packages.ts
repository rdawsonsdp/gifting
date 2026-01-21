export interface GiftPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  productDescription: {
    headline: string;
    subheadline: string;
    body: string;
    includes: string[];
    details: string[];
  };
  price: number;
  image: string;
  includes: string[];
}

export const PACKAGES: GiftPackage[] = [
  {
    id: 'sweet-essentials',
    name: 'Sweet Essentials',
    slug: 'sweet-essentials',
    description: 'A curated selection of our most popular treats',
    longDescription: 'The perfect introduction to Brown Sugar Bakery. This thoughtfully curated package includes our most beloved treats, hand-selected to delight any recipient. Ideal for client appreciation or employee recognition.',
    productDescription: {
      headline: 'Your perfect selection of Southern gourmet candies.',
      subheadline: 'All in a beautifully crafted gift box.',
      body: 'Introducing our Sweet Essentials Gift Box, a delightful showcase of handcrafted treats from Brown Sugar Bakery. This delightful ensemble boasts our renowned butter cookies, delectable caramel squares, and irresistible chocolate truffles. Each treat is carefully nestled within the artistry of a beautifully branded gift box, making it a gift as visually stunning as it is delicious.',
      includes: [
        'Six individually wrapped assorted butter cookies.',
        'Four signature caramel squares.',
        'Four handcrafted chocolate truffles.',
        'Branded gift box with ribbon.',
        'Personalized gift card.',
      ],
      details: [
        'Made fresh to order.',
        'Delivered in a keepsake gift box.',
        'Ships within 3-5 business days.',
      ],
    },
    price: 45,
    image: '',
    includes: [
      'Assorted Butter Cookies (6 pcs)',
      'Signature Caramel Squares (4 pcs)',
      'Chocolate Truffles (4 pcs)',
      'Branded Gift Box',
      'Personalized Gift Card',
    ],
  },
  {
    id: 'celebration-box',
    name: 'Celebration Box',
    slug: 'celebration-box',
    description: 'Perfect for milestones and special occasions',
    longDescription: 'Make every milestone memorable with our Celebration Box. Packed with premium sweets and festive favorites, this package is designed to make birthdays, promotions, and achievements extra special.',
    productDescription: {
      headline: 'Make every celebration unforgettable.',
      subheadline: 'Packed with premium sweets in an elegant presentation.',
      body: 'Our Celebration Box is the ultimate gift for marking life\'s special moments. Packed with an abundance of our finest confections, this luxurious assortment features gourmet cookies, premium fudge, chocolate-dipped strawberries, and artisan caramel corn. Perfect for birthdays, promotions, anniversaries, or simply to say "congratulations" in the sweetest way possible.',
      includes: [
        'Twelve gourmet cookie assortment.',
        'Eight pieces of premium fudge selection.',
        'Six chocolate-dipped strawberries.',
        'One bag of artisan caramel corn.',
        'Deluxe gift box with satin ribbon.',
        'Personalized gift card.',
      ],
      details: [
        'Made fresh to order.',
        'Strawberries shipped with cold pack.',
        'Delivered in a deluxe presentation box.',
        'Ships within 3-5 business days.',
      ],
    },
    price: 75,
    image: '',
    includes: [
      'Gourmet Cookie Assortment (12 pcs)',
      'Premium Fudge Selection (8 pcs)',
      'Chocolate-Dipped Strawberries (6 pcs)',
      'Artisan Caramel Corn',
      'Deluxe Gift Box with Ribbon',
      'Personalized Gift Card',
    ],
  },
  {
    id: 'executive-collection',
    name: 'Executive Collection',
    slug: 'executive-collection',
    description: 'Premium gifts for your most valued clients',
    longDescription: 'Our most prestigious offering for those who deserve the very best. The Executive Collection features our finest confections, elegantly presented in a luxurious keepsake box. Perfect for VIP clients, executives, and special partnerships.',
    productDescription: {
      headline: 'The pinnacle of corporate gifting excellence.',
      subheadline: 'An unforgettable impression in a luxury keepsake box.',
      body: 'The Executive Collection represents the very best of Brown Sugar Bakery, curated for those who deserve nothing less than extraordinary. This premium assortment features our signature cake, an extensive chocolate collection, towering cookie display, and artisan caramel gifts. Presented in an elegant keepsake box with white glove delivery service, this gift makes a lasting impression on your most valued clients and partners.',
      includes: [
        'One signature cake (serves 8-10).',
        'Sixteen pieces premium chocolate collection.',
        'Eighteen piece gourmet cookie tower.',
        'Artisan caramel gift set.',
        'Six chocolate-covered pretzel rods.',
        'Luxury keepsake box.',
        'Handwritten gift card.',
      ],
      details: [
        'Made fresh to order.',
        'White glove delivery included.',
        'Presented in luxury keepsake packaging.',
        'Ships within 5-7 business days.',
        'Temperature-controlled shipping.',
      ],
    },
    price: 150,
    image: '',
    includes: [
      'Signature Cake (serves 8-10)',
      'Premium Chocolate Collection (16 pcs)',
      'Gourmet Cookie Tower (18 pcs)',
      'Artisan Caramel Gift Set',
      'Chocolate-Covered Pretzel Rods (6 pcs)',
      'Luxury Keepsake Box',
      'Handwritten Gift Card',
      'White Glove Delivery',
    ],
  },
];

export function getPackageBySlug(slug: string): GiftPackage | undefined {
  return PACKAGES.find(pkg => pkg.slug === slug);
}
