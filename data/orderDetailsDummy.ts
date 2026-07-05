import type { EcomBillDetail, EcomOrderDetail } from "@/lib/orders/types";

const ORDER_21: EcomOrderDetail = {
  id: "order-21",
  orderNo: 21,
  customerName: "Priyanka",
  orderType: "Handwork Blouse Design",
  membershipTier: "PREMIUM",
  expectedDate: "2021-05-05",
  status: "In Progress",
  progressPercent: 40,
  productionStages: [
    { name: "PATTERN", completed: true },
    { name: "CUTTING", completed: true },
    { name: "STITCHING", completed: true },
    { name: "FINISHING", completed: false },
  ],
  designReferences: [
    { label: "Silk Fabric", imageUrl: "/images/product-1.svg" },
    { label: "Mandarin Neck", imageUrl: "/images/product-2.svg" },
    { label: "Deep Oval", imageUrl: "/images/product-3.svg" },
    { label: "Elbow Length", imageUrl: "/images/product-4.svg" },
    { label: "Tassels & Latkan", imageUrl: "/images/product-5.svg" },
    { label: "Pattern Sketch", imageUrl: "/images/product-6.svg" },
  ],
  customizations: [
    { label: "CUPS", value: "YES" },
    { label: "ZIP", value: "BACK" },
    { label: "PIPING", value: "GOLD" },
    { label: "LINING", value: "COTTON" },
  ],
  measurements: [
    { name: "FULL LENGTH", value: "23 ¼" },
    { name: "SHOULDER", value: "13" },
    { name: "CHEST ROUND", value: "36" },
    { name: "WAIST ROUND", value: "30" },
    { name: "SLEEVES", value: "11 ½" },
    { name: "NECK DEEP", value: "8" },
    { name: "ARMHOLE", value: "16" },
    { name: "BUST POINT", value: "9" },
  ],
  measurementUnit: "INCHES",
  relatedOrders: [
    { id: "order-21", orderNo: 21 },
    { id: "order-20", orderNo: 20 },
    { id: "order-19", orderNo: 19 },
  ],
};

const ORDER_20: EcomOrderDetail = {
  ...ORDER_21,
  id: "order-20",
  orderNo: 20,
  orderType: "Designer Lehenga",
  status: "Pattern Ready",
  progressPercent: 25,
  productionStages: [
    { name: "PATTERN", completed: true },
    { name: "CUTTING", completed: false },
    { name: "STITCHING", completed: false },
    { name: "FINISHING", completed: false },
  ],
};

const ORDER_19: EcomOrderDetail = {
  ...ORDER_21,
  id: "order-19",
  orderNo: 19,
  orderType: "Party Wear Gown",
  status: "Delivered",
  progressPercent: 100,
  productionStages: [
    { name: "PATTERN", completed: true },
    { name: "CUTTING", completed: true },
    { name: "STITCHING", completed: true },
    { name: "FINISHING", completed: true },
  ],
};

const ORDER_BY_ID: Record<string, EcomOrderDetail> = {
  "order-21": ORDER_21,
  "order-20": ORDER_20,
  "order-19": ORDER_19,
  c1: ORDER_21,
  c2: ORDER_19,
};

const BILL_B1: EcomBillDetail = {
  id: "b1",
  billNo: 324,
  orderDate: "2021-06-05",
  dueDate: "2021-06-12",
  customerName: "John Doe",
  customerPhone: "+91 99999 99999",
  subtotal: "4600.00",
  total: "4600.00",
  advancePaid: "2600.00",
  advancePaidDate: "2021-12-28",
  balance: "2000.00",
  tailorDetails: {
    boutiqueName: "Star Boutique",
    logoUrl: null,
    address: "123 Fashion Lane, Premium District",
    city: "Mumbai",
    state: "MH",
    pincode: "400001",
    phone: "+91 98765 43210",
  },
  items: [
    {
      id: "item-1",
      orderId: "order-21",
      orderNo: 21,
      description: "Handwork Blouse",
      orderType: "Blouse",
      imageUrl: "/images/product-1.svg",
      unitPrice: "900.00",
      qty: 3,
      lineTotal: "2700.00",
    },
    {
      id: "item-2",
      orderId: "order-20",
      orderNo: 20,
      description: "Designer Lehenga",
      orderType: "Lehenga",
      imageUrl: "/images/product-2.svg",
      unitPrice: "950.00",
      qty: 1,
      lineTotal: "950.00",
    },
    {
      id: "item-3",
      orderId: "order-19",
      orderNo: 19,
      description: "Party Wear Gown",
      orderType: "Gown",
      imageUrl: "/images/product-3.svg",
      unitPrice: "950.00",
      qty: 1,
      lineTotal: "950.00",
    },
  ],
};

const BILL_BY_ID: Record<string, EcomBillDetail> = {
  b1: BILL_B1,
};

export function getDummyOrderDetail(orderId: string): EcomOrderDetail | null {
  return ORDER_BY_ID[orderId] ?? ORDER_21;
}

export function getDummyBillDetail(billId: string): EcomBillDetail | null {
  return BILL_BY_ID[billId] ?? BILL_B1;
}
