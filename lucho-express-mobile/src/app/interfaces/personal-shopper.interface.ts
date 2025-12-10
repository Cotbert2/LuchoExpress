export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  personalShopperId?: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orderProducts: OrderProduct[];
  customerInfo?: CustomerInfo;
}

export interface OrderProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface PersonalShopper {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: PersonalShopperStatus;
  activeOrders: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum PersonalShopperStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE'
}

export interface Message {
  id: string;
  orderId: string;
  customerId: string;
  personalShopperId: string;
  content: string;
  type: MessageType;
  senderType: string;
  senderId: string;
  senderName: string;
  isRead: boolean;
  createdAt: string;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LOCATION = 'LOCATION',
  SYSTEM = 'SYSTEM'
}

export interface CreateMessageDto {
  orderId: string;
  customerId: string;
  personalShopperId: string;
  content: string;
  type: MessageType;
  senderType: string;
  senderId: string;
  senderName: string;
}
