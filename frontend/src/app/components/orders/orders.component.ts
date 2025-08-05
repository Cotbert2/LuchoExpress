import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, OrderResponse } from '../../services/order.service';
import { TrackingService } from '../../services/tracking.service';
import { OrderStatus } from '../../interfaces/order.interface';
import { TrackingStatus, TrackingResponse, OrderStatusEnum } from '../../interfaces/tracking.interface';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';

import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    DatePickerModule,
    ToolbarModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
    BadgeModule,
    SkeletonModule,
    TooltipModule,
    DialogModule,
    DividerModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class OrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  loading = false;
  cancellingOrderId: string | null = null;
  
  // Filtros
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  searchValue: string = '';

  // Para el estado de las órdenes
  orderStatus = OrderStatus;

  // Para el modal de tracking
  trackingModalVisible = false;
  trackingData: TrackingStatus | null = null;
  trackingResponseTime: number = 0;
  trackingLoading = false;
  trackingError: string | null = null;
  currentTrackingOrderNumber: string = '';

  constructor(
    private orderService: OrderService,
    private trackingService: TrackingService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.filteredOrders = [...this.orders];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load orders'
        });
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      
      // Filtro por fechas
      const dateFilter = (!this.dateFrom || orderDate >= this.dateFrom) &&
                        (!this.dateTo || orderDate <= this.dateTo);
      
      // Filtro por búsqueda
      const searchFilter = !this.searchValue || 
                          order.orderNumber.toLowerCase().includes(this.searchValue.toLowerCase()) ||
                          order.deliveryAddress.toLowerCase().includes(this.searchValue.toLowerCase());
      
      return dateFilter && searchFilter;
    });
  }

  clearFilters() {
    this.dateFrom = null;
    this.dateTo = null;
    this.searchValue = '';
    this.filteredOrders = [...this.orders];
  }

  cancelOrder(order: OrderResponse) {
    this.confirmationService.confirm({
      message: `Are you sure you want to cancel order ${order.orderNumber}? This action cannot be undone.`,
      header: 'Cancel Order',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Yes, Cancel Order',
      rejectLabel: 'No, Keep Order',
      accept: () => {
        this.cancellingOrderId = order.id;
        this.orderService.cancelOrder(order.id).subscribe({
          next: (updatedOrder) => {
            // Actualizar la orden en la lista
            const index = this.orders.findIndex(o => o.id === order.id);
            if (index !== -1) {
              this.orders[index] = updatedOrder;
            }
            
            // Actualizar filteredOrders también
            const filteredIndex = this.filteredOrders.findIndex(o => o.id === order.id);
            if (filteredIndex !== -1) {
              this.filteredOrders[filteredIndex] = updatedOrder;
            }

            this.cancellingOrderId = null;
            this.messageService.add({
              severity: 'success',
              summary: 'Order Cancelled',
              detail: `Order ${order.orderNumber} has been cancelled successfully`
            });
          },
          error: (error) => {
            this.cancellingOrderId = null;
            console.error('Error canceling order:', error);
            
            let errorMessage = 'Could not cancel the order. Please try again.';
            
            // Handle specific error cases
            if (error.status === 403) {
              errorMessage = 'You don\'t have permission to cancel this order.';
            } else if (error.status === 400) {
              errorMessage = 'This order cannot be cancelled in its current status.';
            } else if (error.status === 404) {
              errorMessage = 'Order not found.';
            }
            
            this.messageService.add({
              severity: 'error',
              summary: 'Cancellation Failed',
              detail: errorMessage
            });
          }
        });
      }
    });
  }

  canCancelOrder(status: string): boolean {
    // Only PENDING orders can be cancelled, matching backend logic
    return status === OrderStatus.PENDING;
  }

  isCancellingOrder(orderId: string): boolean {
    return this.cancellingOrderId === orderId;
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.CONFIRMED:
        return 'info';
      case OrderStatus.PROCESSING:
        return 'secondary';
      case OrderStatus.SHIPPED:
        return 'info';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'danger';
      default:
        return 'contrast';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.CONFIRMED:
        return 'Confirmed';
      case OrderStatus.PROCESSING:
        return 'Processing';
      case OrderStatus.SHIPPED:
        return 'Shipped';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CO');
  }

  getActionMessage(status: string): string {
    switch (status) {
      case OrderStatus.SHIPPED:
        return 'Shipped';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'No actions';
    }
  }

  getActionTooltip(status: string): string {
    switch (status) {
      case OrderStatus.SHIPPED:
        return 'Order has been shipped and cannot be cancelled';
      case OrderStatus.DELIVERED:
        return 'Order has been delivered and cannot be cancelled';
      case OrderStatus.CANCELLED:
        return 'Order has already been cancelled';
      default:
        return 'No actions available for this order status';
    }
  }

  // Métodos para el modal de tracking
  openTrackingModal(orderNumber: string) {
    this.currentTrackingOrderNumber = orderNumber;
    this.trackingModalVisible = true;
    this.fetchTrackingData(orderNumber);
  }

  closeTrackingModal() {
    this.trackingModalVisible = false;
    this.trackingData = null;
    this.trackingError = null;
    this.currentTrackingOrderNumber = '';
    this.trackingResponseTime = 0;
  }

  fetchTrackingData(orderNumber: string) {
    this.trackingLoading = true;
    this.trackingError = null;
    this.trackingData = null;

    try {
      this.trackingService.getTrackingStatus(orderNumber).subscribe({
        next: (response: TrackingResponse) => {
          this.trackingData = response.data;
          this.trackingResponseTime = response.responseTime;
          this.trackingLoading = false;
        },
        error: (error) => {
          this.trackingLoading = false;
          this.trackingResponseTime = error.responseTime || 0;
          
          // Manejo específico de errores de autenticación
          if (error.status === 401) {
            this.trackingError = 'Authentication required. Please log in to view tracking information.';
            this.messageService.add({
              severity: 'warn',
              summary: 'Authentication Required',
              detail: 'Please log in to view tracking information'
            });
          } else if (error.status === 403) {
            this.trackingError = 'Access denied. You don\'t have permission to view this order\'s tracking information.';
            this.messageService.add({
              severity: 'error',
              summary: 'Access Denied',
              detail: 'You don\'t have permission to view this order'
            });
          } else if (error.status === 404) {
            this.trackingError = error.error?.message || 'No tracking information found for this order';
          } else if (error.status === 500) {
            this.trackingError = error.error?.message || 'Internal server error occurred';
          } else {
            this.trackingError = 'Failed to fetch tracking information';
          }

          console.error('Error fetching tracking data:', error);
        }
      });
    } catch (authError: any) {
      // Manejo de errores de token (cuando no hay token disponible)
      this.trackingLoading = false;
      this.trackingError = authError.message || 'Authentication token not available. Please log in.';
      this.messageService.add({
        severity: 'warn',
        summary: 'Authentication Required',
        detail: 'Please log in to view tracking information'
      });
      console.error('Authentication error:', authError);
    }
  }

  reloadTrackingData() {
    if (this.currentTrackingOrderNumber) {
      this.fetchTrackingData(this.currentTrackingOrderNumber);
    }
  }

  getTrackingStatusSeverity(status: OrderStatusEnum): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    switch (status) {
      case OrderStatusEnum.PENDING:
        return 'warning';
      case OrderStatusEnum.SHIPPED:
        return 'info';
      case OrderStatusEnum.DELIVERED:
        return 'success';
      case OrderStatusEnum.CANCELLED:
        return 'danger';
      default:
        return 'contrast';
    }
  }

  getTrackingStatusLabel(status: OrderStatusEnum): string {
    switch (status) {
      case OrderStatusEnum.PENDING:
        return 'Pending';
      case OrderStatusEnum.SHIPPED:
        return 'Shipped';
      case OrderStatusEnum.DELIVERED:
        return 'Delivered';
      case OrderStatusEnum.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }
}
