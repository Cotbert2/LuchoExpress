import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CreateOrderProductRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: string;
  products: CreateOrderProductRequest[];
  deliveryAddress: string;
  estimatedDeliveryDate?: string;
}

export interface OrderProductResponse {
  id: string;
  productId: string;
  quantity: number;
  productName: string;
  unitPrice: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  products: OrderProductResponse[];
  deliveryAddress: string;
  status: string;
  orderDate: string;
  estimatedDeliveryDate?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = `${environment.ordersUrl}/orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get HTTP headers with authorization
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Create a new order
   */
  createOrder(orderData: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.baseUrl, orderData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get my orders
   */
  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.baseUrl}/me`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.baseUrl}/${orderId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get all orders (admin only)
   */
  getAllOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }
}
