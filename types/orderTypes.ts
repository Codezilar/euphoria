// Define order status types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'on-hold' | 'backordered';

// Define payment status types
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'partially-paid';

// Define shipping status types
export type ShippingStatus = 'unfulfilled' | 'fulfilled' | 'partial' | 'delivered' | 'returned';

// Define order type
export interface OrderItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
  image: string;
  category: string;
  brand: string;
  weight: number;
  dimensions: string;
}

export interface ShippingInfo {
  method: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  cost: number;
  status: ShippingStatus;
}

export interface BillingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  company?: string;
}

export interface OrderNote {
  id: number;
  date: string;
  author: string;
  note: string;
  type: 'internal' | 'customer';
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  orderTime: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  billingAddress: BillingInfo;
  shippingAddress: BillingInfo;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  notes: OrderNote[];
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'mobile-app' | 'phone' | 'in-store';
  couponCode?: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

// Status configuration
export const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'warning' as const,
    icon: 'Pending',
    description: 'Order received, awaiting confirmation'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'info' as const,
    icon: 'Verified',
    description: 'Order confirmed, processing payment'
  },
  processing: {
    label: 'Processing',
    color: 'info' as const,
    icon: 'Inventory',
    description: 'Order is being prepared'
  },
  shipped: {
    label: 'Shipped',
    color: 'primary' as const,
    icon: 'LocalShipping',
    description: 'Order has been shipped'
  },
  delivered: {
    label: 'Delivered',
    color: 'success' as const,
    icon: 'CheckCircle',
    description: 'Order delivered successfully'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'error' as const,
    icon: 'Cancel',
    description: 'Order was cancelled'
  },
  refunded: {
    label: 'Refunded',
    color: 'error' as const,
    icon: 'Warning',
    description: 'Order refund processed'
  },
  'on-hold': {
    label: 'On Hold',
    color: 'warning' as const,
    icon: 'Pending',
    description: 'Order placed on hold'
  },
  backordered: {
    label: 'Backordered',
    color: 'warning' as const,
    icon: 'Inventory',
    description: 'Items are backordered'
  }
};

export const paymentStatusConfig = {
  paid: { 
    label: 'Paid', 
    color: 'success' as const, 
    icon: 'CheckCircle' 
  },
  pending: { 
    label: 'Pending', 
    color: 'warning' as const, 
    icon: 'Pending' 
  },
  failed: { 
    label: 'Failed', 
    color: 'error' as const, 
    icon: 'Cancel' 
  },
  refunded: { 
    label: 'Refunded', 
    color: 'error' as const, 
    icon: 'Warning' 
  },
  'partially-paid': { 
    label: 'Partially Paid', 
    color: 'info' as const, 
    icon: 'AttachMoney' 
  }
};

export const shippingStatusConfig = {
  unfulfilled: { label: 'Unfulfilled', color: 'warning' as const },
  fulfilled: { label: 'Fulfilled', color: 'info' as const },
  partial: { label: 'Partial', color: 'warning' as const },
  delivered: { label: 'Delivered', color: 'success' as const },
  returned: { label: 'Returned', color: 'error' as const }
};

export const priorityConfig = {
  low: { label: 'Low', color: 'success' as const },
  medium: { label: 'Medium', color: 'warning' as const },
  high: { label: 'High', color: 'error' as const }
};

export const sourceConfig = {
  'website': { label: 'Website', color: 'primary' as const },
  'mobile-app': { label: 'Mobile App', color: 'secondary' as const },
  'phone': { label: 'Phone', color: 'info' as const },
  'in-store': { label: 'In-Store', color: 'warning' as const }
};

// Helper function to safely get payment status config
export const getPaymentStatusConfig = (status: PaymentStatus) => {
  const config = paymentStatusConfig[status];
  if (!config) {
    console.warn(`Unknown payment status: ${status}. Defaulting to 'pending'.`);
    return paymentStatusConfig.pending;
  }
  return config;
};