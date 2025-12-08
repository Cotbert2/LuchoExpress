export interface TrackingStatus {
  orderId: string;
  orderNumber: string;
  userId: string;
  status: OrderStatusEnum;
  updatedAt: string;
}

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface TrackingResponse {
  data: TrackingStatus;
  responseTime: number;
}

export interface TrackingError {
  error: string;
  message: string;
}
