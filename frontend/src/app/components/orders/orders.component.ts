import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, OrderResponse } from '../../services/order.service';
import { OrderStatus } from '../../interfaces/order.interface';

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
    SkeletonModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class OrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  loading = false;
  
  // Filtros
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  searchValue: string = '';

  // Para el estado de las órdenes
  orderStatus = OrderStatus;

  constructor(
    private orderService: OrderService,
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
      message: `Are you sure you want to cancel order ${order.orderNumber}?`,
      header: 'Confirm Cancellation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, cancel',
      rejectLabel: 'No',
      accept: () => {
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

            this.messageService.add({
              severity: 'success',
              summary: 'Order Cancelled',
              detail: `Order ${order.orderNumber} has been cancelled successfully`
            });
          },
          error: (error) => {
            console.error('Error canceling order:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Could not cancel the order. Please try again.'
            });
          }
        });
      }
    });
  }

  canCancelOrder(status: string): boolean {
    return status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED;
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
}
