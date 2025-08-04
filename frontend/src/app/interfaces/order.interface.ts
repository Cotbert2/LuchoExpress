export interface CreateOrderProductRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: number;
  products: CreateOrderProductRequest[];
  deliveryAddress: string;
  estimatedDeliveryDate: string;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName?: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  orderDate: string;
  deliveryAddress: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  products: OrderProductResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderProductResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED', 
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface MyOrdersResponse {
  orders: OrderResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}
