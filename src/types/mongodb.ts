import { ObjectId } from "mongodb";

// MongoDB 文档基础接口
export interface BaseDocument {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// 用户模型
export interface UserDocument extends BaseDocument {
  email: string;
  name?: string;
  phone?: string;
  password?: string;
  role: "ADMIN" | "CUSTOMER" | "STAFF";
  isActive: boolean;
  avatar?: string;
  lastLoginAt?: Date;
}

// 分类模型
export interface CategoryDocument extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  parentId?: ObjectId;
  level: number;
  sortOrder: number;
}

// 产品模型
export interface ProductDocument extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  trackQuantity: boolean;
  quantity: number;
  weight?: number;
  images: string[];
  tags: string[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  isActive: boolean;
  categoryId: ObjectId;
  variants?: ProductVariant[];
  metadata?: Record<string, any>;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  options: Record<string, string>;
}

// 地址模型
export interface AddressDocument extends BaseDocument {
  userId: ObjectId;
  type: "SHIPPING" | "BILLING";
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  phone?: string;
  isDefault: boolean;
}

// 购物车模型
export interface CartDocument extends BaseDocument {
  sessionId?: string;
  userId?: ObjectId;
  items: CartItem[];
  total: number;
  currency: string;
}

export interface CartItem {
  productId: ObjectId;
  quantity: number;
  price: number;
  total: number;
  addedAt: Date;
}

// 订单模型
export interface OrderDocument extends BaseDocument {
  orderNumber: string;
  userId?: ObjectId;
  guestEmail?: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  paymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED";
  paymentMethod?: "STRIPE" | "CASH_ON_DELIVERY" | "BANK_TRANSFER";
  currency: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string;
  addressId?: ObjectId;
  items: OrderItem[];
  shippingInfo?: ShippingInfo;
  paymentInfo?: PaymentInfo;
}

export interface OrderItem {
  productId: ObjectId;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface ShippingInfo {
  method: string;
  cost: number;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface PaymentInfo {
  method: string;
  transactionId?: string;
  paidAt?: Date;
  amount: number;
}

// 评价模型
export interface ReviewDocument extends BaseDocument {
  userId: ObjectId;
  productId: ObjectId;
  rating: number;
  title?: string;
  content?: string;
  isApproved: boolean;
  helpfulCount: number;
}

// 集合名称常量
export const COLLECTIONS = {
  USERS: "users",
  CATEGORIES: "categories",
  PRODUCTS: "products",
  ADDRESSES: "addresses",
  CARTS: "carts",
  ORDERS: "orders",
  ORDER_ITEMS: "order_items",
  REVIEWS: "reviews",
} as const;

// 索引定义
export const INDEXES = {
  USERS: [
    { email: 1 }, // 唯一索引
    { role: 1 },
    { isActive: 1 },
    { createdAt: -1 },
  ],
  CATEGORIES: [
    { slug: 1 }, // 唯一索引
    { parentId: 1 },
    { isActive: 1 },
    { sortOrder: 1 },
  ],
  PRODUCTS: [
    { sku: 1 }, // 唯一索引
    { slug: 1 }, // 唯一索引
    { categoryId: 1 },
    { status: 1 },
    { isActive: 1 },
    { featured: 1 },
    { price: 1 },
    { createdAt: -1 },
    { tags: 1 }, // 文本索引
    { name: "text", description: "text" }, // 文本搜索索引
  ],
  ORDERS: [
    { orderNumber: 1 }, // 唯一索引
    { userId: 1 },
    { status: 1 },
    { paymentStatus: 1 },
    { createdAt: -1 },
  ],
  REVIEWS: [
    { userId: 1, productId: 1 }, // 复合唯一索引
    { productId: 1 },
    { isApproved: 1 },
    { rating: 1 },
    { createdAt: -1 },
  ],
} as const;
