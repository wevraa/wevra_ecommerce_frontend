export interface OrderDesignReference {
  label: string;
  imageUrl: string;
}

export interface OrderCustomization {
  label: string;
  value: string;
}

export interface OrderMeasurement {
  name: string;
  value: string;
  unit?: string;
}

export interface OrderRelatedTab {
  id: string;
  orderNo: number;
}

export interface ProductionStage {
  name: string;
  completed: boolean;
}

export interface OrderTailorDetails {
  boutiqueName?: string;
  logoUrl?: string | null;
  address?: string;
  phone?: string;
}

export interface EcomOrderDetail {
  id: string;
  orderNo: number;
  customerName: string;
  orderType: string;
  membershipTier?: string;
  expectedDate: string | null;
  status: string;
  progressPercent: number;
  productionStages: ProductionStage[];
  designReferences: OrderDesignReference[];
  customizations: OrderCustomization[];
  measurements: OrderMeasurement[];
  measurementUnit: string;
  relatedOrders: OrderRelatedTab[];
  tailorDetails?: OrderTailorDetails;
}

export interface BillTailorDetails {
  boutiqueName: string;
  logoUrl?: string | null;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

export interface BillLineItem {
  id: string;
  orderId?: string;
  orderNo?: number;
  description: string;
  orderType?: string;
  imageUrl?: string;
  statusLabel?: string;
  unitPrice: string;
  qty: number;
  lineTotal: string;
}

export interface EcomBillDetail {
  id: string;
  billNo: number;
  orderDate: string | null;
  dueDate: string | null;
  customerName: string;
  customerPhone?: string;
  subtotal: string;
  total: string;
  advancePaid: string;
  advancePaidDate?: string | null;
  balance: string;
  tailorDetails: BillTailorDetails;
  items: BillLineItem[];
}
