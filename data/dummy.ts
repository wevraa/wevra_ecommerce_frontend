export interface Category {
  id: string;
  label: string;
  slug: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
}

export interface DealItem {
  id: string;
  title: string;
  image?: string;
}

export interface Product {
  id: string;
  brand: string;
  price: number;
  image: string;
  alt: string;
  shortDescription?: string;
}

export interface ProductDetail extends Product {
  images: string[];
  details: string;
  fitFabric: string;
  shippingReturn: string;
}

export interface Review {
  id: string;
  quote: string;
  author: string;
  avatar?: string;
}

export interface SizeOption {
  id: string;
  label: string;
}

export interface FooterAccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface BottomNavItem {
  id: string;
  label: string;
  icon: "home" | "search" | "measure" | "profile" | "cart";
  active?: boolean;
}

export const categories: Category[] = [
  { id: "1", label: "All Products", slug: "all" },
  { id: "2", label: "Lehengas", slug: "lehengas" },
  { id: "3", label: "Sarees", slug: "sarees" },
  { id: "4", label: "Fabrics", slug: "fabrics" },
  { id: "5", label: "Blouses", slug: "blouses" },
  { id: "6", label: "Kurtis", slug: "kurtis" },
];

export const heroSlides: HeroSlide[] = [
  { id: "1", image: "/images/hero-1.svg", alt: "WEVRAA festive collection" },
  { id: "2", image: "/images/hero-2.svg", alt: "New arrivals" },
  { id: "3", image: "/images/hero-3.svg", alt: "Custom stitching" },
];

export const promoBannerText =
  "Discounts, Gifts, Festive Offers, New Arrivals";

export const dealItems: DealItem[] = [
  { id: "1", title: "Festive Sale", image: "/images/deals-1.svg" },
  { id: "2", title: "New Arrivals", image: "/images/deals-2.svg" },
  { id: "3", title: "Tailoring Offers", image: "/images/deals-3.svg" },
  { id: "4", title: "Bulk Orders", image: "/images/deals-4.svg" },
];

export const sizes: SizeOption[] = [
  { id: "xs", label: "XS" },
  { id: "s", label: "S" },
  { id: "m", label: "M" },
  { id: "l", label: "L" },
  { id: "xl", label: "XL" },
  { id: "2xl", label: "2XL" },
  { id: "3xl", label: "3XL" },
  { id: "4xl", label: "4XL" },
];

export const sizeMeasurements = {
  bust: 24,
  waist: 24,
  hip: 24,
};

export const featuredProducts: Product[] = [
  {
    id: "1",
    brand: "Two Sisters By Happy Creations",
    price: 2576,
    image: "/images/product-1.svg",
    alt: "Saree by Two Sisters",
    shortDescription: "Green Georgette Embroidery, Sequins, Zari Pre-d",
  },
  {
    id: "2",
    brand: "Two Sisters By Happy Creations",
    price: 2576,
    image: "/images/product-2.svg",
    alt: "Saree by Two Sisters",
    shortDescription: "Green Georgette Embroidery, Sequins, Zari Pre-d",
  },
  {
    id: "3",
    brand: "Ethnic Weaves",
    price: 2299,
    image: "/images/product-3.svg",
    alt: "Lehenga by Ethnic Weaves",
    shortDescription: "Silk blend with thread work",
  },
  {
    id: "4",
    brand: "Fabrics & Co",
    price: 1899,
    image: "/images/product-4.svg",
    alt: "Saree by Fabrics & Co",
    shortDescription: "Cotton art silk printed",
  },
  {
    id: "5",
    brand: "Custom Stitch Studio",
    price: 3200,
    image: "/images/product-5.svg",
    alt: "Custom blouse set",
    shortDescription: "Designer blouse with embroidery",
  },
  {
    id: "6",
    brand: "WEVRAA Exclusive",
    price: 2599,
    image: "/images/product-6.svg",
    alt: "Exclusive collection",
    shortDescription: "Premium fabric with custom stitching",
  },
];

const productDetailsMap: Record<string, Omit<ProductDetail, "id" | "brand" | "price" | "image" | "alt" | "shortDescription">> = {
  "1": {
    images: ["/images/product-1.svg", "/images/product-2.svg"],
    details:
      "Updated with a straight neckline for a seamless look under scoop neck styles. Updated with a straight neckline for a seamless look under scoop neck styles. Fine embroidery and zari work for festive occasions.",
    fitFabric:
      "Georgette fabric with soft drape. Regular fit. Model height 5'6\", wearing size S. Hand wash recommended.",
    shippingReturn:
      "Standard delivery in 5–7 business days. Express delivery available. Easy 7-day returns on unused items with original tags.",
  },
  "2": {
    images: ["/images/product-2.svg", "/images/product-1.svg"],
    details:
      "Green georgette with embroidery and sequins. Perfect for weddings and festivals. Comfortable all-day wear.",
    fitFabric:
      "Georgette fabric. Regular fit. Hand wash cold. Do not bleach.",
    shippingReturn:
      "Delivery in 5–7 days. 7-day return policy. Free shipping on orders above ₹1999.",
  },
  "3": {
    images: ["/images/product-3.svg"],
    details:
      "Silk blend lehenga with thread work. Elegant and lightweight for special occasions.",
    fitFabric:
      "Silk blend. Semi-stitched. Hand wash or dry clean.",
    shippingReturn:
      "5–7 business days. 7-day returns. Exchange available for size.",
  },
  "4": {
    images: ["/images/product-4.svg"],
    details:
      "Cotton art silk printed saree. Easy to drape and maintain. Ideal for daily and occasional wear.",
    fitFabric:
      "Cotton art silk. Unstitched. Machine wash cold.",
    shippingReturn:
      "Standard delivery 5–7 days. Returns within 7 days.",
  },
  "5": {
    images: ["/images/product-5.svg"],
    details:
      "Designer blouse with embroidery. Pairs well with sarees and lehengas. Custom stitching available.",
    fitFabric:
      "Blouse piece. Provide measurements for custom stitching. Fabric as per listing.",
    shippingReturn:
      "Delivery in 7–10 days (custom stitching). 7-day return on unstitched items.",
  },
  "6": {
    images: ["/images/product-6.svg"],
    details:
      "WEVRAA exclusive design. Premium fabric with meticulous finishing. Limited stock.",
    fitFabric:
      "Premium fabric. Regular fit. Care instructions on label.",
    shippingReturn:
      "5–7 days delivery. 7-day return policy. Free shipping over ₹2499.",
  },
};

export function getProductDetail(id: string): ProductDetail | null {
  const product = featuredProducts.find((p) => p.id === id);
  if (!product) return null;
  const extra = productDetailsMap[id];
  if (!extra) return null;
  return {
    ...product,
    ...extra,
  };
}

export function getCompleteTheLookAndSimilar(productId: string): {
  completeTheLook: Product[];
  similarStyles: Product[];
} {
  const others = featuredProducts.filter((p) => p.id !== productId);
  return {
    completeTheLook: others.slice(0, 4),
    similarStyles: others.slice(0, 4),
  };
}

export const reviews: Review[] = [
  {
    id: "1",
    quote: "Excellent quality fabric and perfect stitching. My wedding order was delivered on time and everyone loved the outfits.",
    author: "Priya S.",
    avatar: "/images/review-1.svg",
  },
  {
    id: "2",
    quote: "Best platform for bulk orders. We ordered uniforms for our boutique and the consistency was impressive.",
    author: "Rajesh M.",
    avatar: "/images/review-2.svg",
  },
  {
    id: "3",
    quote: "Custom sizing was accurate and the fabric selection is amazing. Will definitely order again.",
    author: "Anita K.",
    avatar: "/images/review-3.svg",
  },
];

export const bottomNavItems: BottomNavItem[] = [
  { id: "home", label: "Home", icon: "home", active: true },
  { id: "search", label: "Search", icon: "search" },
  { id: "measure", label: "Measure", icon: "measure" },
  { id: "profile", label: "Profile", icon: "profile" },
  { id: "cart", label: "Cart", icon: "cart" },
];

export const footerShortDesc =
  "A modern Indian platform for custom stitching & fabric-led fashion";

export const footerBullets = [
  "Bulk wedding orders",
  "Boutique-to-boutique orders",
  "Uniform stitching",
];

export const footerAccordionItems: FooterAccordionItem[] = [
  {
    id: "about",
    title: "About Us",
    content:
      "WEVRAA is dedicated to bringing you comfortable, stylish custom fashion. We believe in quality fabrics, precise stitching, and making personal style accessible for every occasion.",
  },
  {
    id: "how",
    title: "How It Works",
    content:
      "Choose your fabric, select your design, share your measurements or size, and we connect you with skilled tailors. Track your order from stitch to delivery.",
  },
  {
    id: "tailors",
    title: "For Tailors & Boutiques",
    content:
      "Partner with WEVRAA to receive bulk and boutique orders. Get access to quality fabrics and a streamlined order management system.",
  },
  {
    id: "help",
    title: "Help & Support",
    content:
      "Need help with sizing, orders, or returns? Our support team is here for you. Reach out via the contact form or email support@wevraa.com.",
  },
];

export const footerLongDesc =
  "WEVRAA brings together traditional craftsmanship and modern convenience. Whether you need a single custom outfit or bulk orders for weddings and boutiques, we ensure meticulous tracking, quality fabrics, and stitching that fits. Your style, your measurements, your timeline.";

export const socialLinks = [
  { id: "instagram", label: "Instagram", href: "#", icon: "ig" },
  { id: "facebook", label: "Facebook", href: "#", icon: "fb" },
  { id: "youtube", label: "YouTube", href: "#", icon: "yt" },
];

// Cart (My Bag)
export interface CartItem {
  id: string;
  productId: string;
  brand: string;
  description: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
}

export const cartItems: CartItem[] = [
  {
    id: "cart-1",
    productId: "1",
    brand: "Two Sisters By Happy Creations",
    description: "Description",
    price: 2576,
    size: "XS",
    image: "/images/product-1.svg",
    quantity: 1,
  },
  {
    id: "cart-2",
    productId: "2",
    brand: "Two Sisters By Happy Creations",
    description: "Description",
    price: 824,
    size: "S",
    image: "/images/product-2.svg",
    quantity: 1,
  },
  {
    id: "cart-3",
    productId: "3",
    brand: "Ethnic Weaves",
    description: "Description",
    price: 2299,
    size: "M",
    image: "/images/product-3.svg",
    quantity: 1,
  },
  {
    id: "cart-4",
    productId: "4",
    brand: "Fabrics & Co",
    description: "Description",
    price: 1899,
    size: "L",
    image: "/images/product-4.svg",
    quantity: 1,
  },
  {
    id: "cart-5",
    productId: "5",
    brand: "Custom Stitch Studio",
    description: "Description",
    price: 1200,
    size: "XL",
    image: "/images/product-5.svg",
    quantity: 2,
  },
  {
    id: "cart-6",
    productId: "6",
    brand: "WEVRAA Exclusive",
    description: "Description",
    price: 2599,
    size: "S",
    image: "/images/product-6.svg",
    quantity: 1,
  },
];

export const frequentlyBroughtTogetherProducts: Product[] = [
  {
    id: "1",
    brand: "Two Sisters By Happy Creations",
    price: 2576,
    image: "/images/product-1.svg",
    alt: "Green saree",
    shortDescription: "Green Georgette Embroidered Designer Saree With Blouse",
  },
  {
    id: "2",
    brand: "Two Sisters By Happy Creations",
    price: 2576,
    image: "/images/product-2.svg",
    alt: "Green saree",
    shortDescription: "Green Georgette Embroidered Designer Saree With Blouse",
  },
];

export const ourPoliciesItems: FooterAccordionItem[] = [
  { id: "about", title: "About Us", content: footerAccordionItems[0].content },
  { id: "how", title: "How It Works", content: footerAccordionItems[1].content },
  { id: "tailors", title: "For Tailors & Boutiques", content: footerAccordionItems[2].content },
  { id: "help", title: "Help & Support", content: footerAccordionItems[3].content },
];

// Profile & Boutiques
export interface UserProfile {
  name: string;
  mobile: string;
  avatar: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  city?: string;
  pincode?: string;
}

export const userProfile: UserProfile = {
  name: "Karthik Vijayakumar Reddy",
  mobile: "99646 39704",
  avatar: "/images/review-1.svg",
  addressLine1: "",
  addressLine2: "",
  state: "",
  city: "",
  pincode: "",
};

export const orderTypes = [
  { id: "hand", label: "Hand Embroidery", selected: true },
  { id: "machine", label: "Machine Embroidery", selected: false },
  { id: "lining", label: "Lining Blouse", selected: false },
];

export const blouseSizes = [
  { id: "32", label: "32" },
  { id: "34", label: "34" },
  { id: "36", label: "36" },
  { id: "38", label: "38" },
];

export interface SelectedImage {
  id: string;
  image: string;
  label: string;
}

export const selectedImages: SelectedImage[] = [
  { id: "1", image: "/images/product-1.svg", label: "Fabric" },
  { id: "2", image: "/images/product-2.svg", label: "Front Neck Design" },
  { id: "3", image: "/images/product-3.svg", label: "Sleeve Design" },
  { id: "4", image: "/images/product-4.svg", label: "Back Detail" },
];

export interface Boutique {
  id: string;
  name: string;
  ordersCompleted: number;
  holdingOrders: number;
  rating: number;
  reviewCount: number;
  image: string;
  selected?: boolean;
}

export const boutiques: Boutique[] = [
  {
    id: "1",
    name: "Star Boutique",
    ordersCompleted: 200,
    holdingOrders: 5,
    rating: 4.5,
    reviewCount: 1200,
    image: "/images/product-3.svg",
    selected: true,
  },
  {
    id: "2",
    name: "Star Boutique",
    ordersCompleted: 200,
    holdingOrders: 5,
    rating: 4.5,
    reviewCount: 1200,
    image: "/images/product-4.svg",
    selected: true,
  },
  {
    id: "3",
    name: "Star Boutique",
    ordersCompleted: 200,
    holdingOrders: 5,
    rating: 4.5,
    reviewCount: 1200,
    image: "/images/product-5.svg",
    selected: true,
  },
  {
    id: "4",
    name: "Star Boutique",
    ordersCompleted: 200,
    holdingOrders: 5,
    rating: 4.5,
    reviewCount: 1200,
    image: "/images/product-1.svg",
    selected: true,
  },
];

// Orders
export interface OnlineOrderItem {
  id: string;
  brand: string;
  description: string;
  price: number;
  size: string;
  status: "Delivered" | "Arriving";
  date: string;
  image: string;
}

export interface CustomOrderItem {
  id: string;
  dateLabel: string;
  status: string;
  description: string;
  image: string;
  progressSegments: number;
  progressFilled: number;
  finishedBy: string;
}

export interface BillOrderItem {
  id: string;
  boutiqueName: string;
  areaName: string;
  deliveredBy: string;
  date: string;
  totalOrders: number;
  orderValue: number;
}

export const onlineOrders: OnlineOrderItem[] = [
  {
    id: "o1",
    brand: "Two Sisters By Happy Creations",
    description: "Description",
    price: 2576,
    size: "XS",
    status: "Delivered",
    date: "15 th September",
    image: "/images/product-1.svg",
  },
  {
    id: "o2",
    brand: "Two Sisters By Happy Creations",
    description: "Description",
    price: 2576,
    size: "XS",
    status: "Arriving",
    date: "15 th September",
    image: "/images/product-1.svg",
  },
];

export const customOrders: CustomOrderItem[] = [
  {
    id: "order-21",
    dateLabel: "Today",
    status: "Fabric Cutting",
    description: "Your Tailor Making Pattern Cutting",
    image: "/images/product-1.svg",
    progressSegments: 5,
    progressFilled: 2,
    finishedBy: "4 Nov",
  },
  {
    id: "order-19",
    dateLabel: "Today",
    status: "Delivered",
    description: "Your order has been delivered",
    image: "/images/product-2.svg",
    progressSegments: 5,
    progressFilled: 5,
    finishedBy: "4 Nov",
  },
];

export const billOrders: BillOrderItem[] = [
  {
    id: "b1",
    boutiqueName: "Star Boutique",
    areaName: "Area Name",
    deliveredBy: "Delivered By",
    date: "15 th September",
    totalOrders: 3,
    orderValue: 2576,
  },
];

// Boutique selection (for order quote)
export const boutiqueSelectionList = [
  { id: "1", name: "Star Boutique", iconColor: "orange" },
  { id: "2", name: "Ap Designer Boutique", iconColor: "orange" },
  { id: "3", name: "Fashion Spray", iconColor: "yellow" },
  { id: "4", name: "Lite Fashions", iconColor: "purple" },
  { id: "5", name: "San Designers", iconColor: "darkpurple" },
];
