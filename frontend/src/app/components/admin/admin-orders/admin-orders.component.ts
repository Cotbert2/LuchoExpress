import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';

import { OrderService, OrderResponse, UpdateOrderRequest, OrderFilters } from '../../../services/order.service';
import { CustomerService, CustomerResponse } from '../../../services/customer-admin.service';
import { AuthService } from '../../../services/auth.service';

interface StatusOption {
  label: string;
  value: string;
}

interface CustomerOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    CardModule,
    TooltipModule,
    TextareaModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  customers: CustomerResponse[] = [];
  loading = false;
  
  // Filtros
  filters: OrderFilters = {};
  statusOptions: StatusOption[] = [
    { label: 'All statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];
  
  customerOptions: CustomerOption[] = [
    { label: 'All customers', value: '' }
  ];
  
  // Dialogs
  displayEditDialog = false;
  displayViewDialog = false;
  
  // Forms
  editOrderForm: UpdateOrderRequest = {};
  selectedOrder: OrderResponse | null = null;
  
  // Estados disponibles para actualización
  availableStatuses: StatusOption[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadCustomers();
    this.loadOrders();
  }

  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.customerOptions = [
          { label: 'All customers', value: '' },
          ...customers.map(customer => ({
            label: `${customer.name} (${customer.email})`,
            value: customer.id
          }))
        ];
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error loading customers'
        });
      }
    });
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error loading orders'
        });
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredOrders = this.orderService.filterOrders(this.orders, this.filters);
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onCustomerFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.filters = {};
    this.filteredOrders = [...this.orders];
  }

  openEditDialog(order: OrderResponse) {
    this.selectedOrder = order;
    this.editOrderForm = {
      status: order.status,
      deliveryAddress: order.deliveryAddress, // keep address unchanged but include it in payload
      estimatedDeliveryDate: order.estimatedDeliveryDate
    };
    this.displayEditDialog = true;
  }

  openViewDialog(order: OrderResponse) {
    this.selectedOrder = order;
    this.displayViewDialog = true;
  }

  updateOrder() {
    if (!this.selectedOrder) {
      return;
    }

    this.orderService.updateOrder(this.selectedOrder.id, this.editOrderForm).subscribe({
      next: (order) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Order updated successfully'
        });
        this.displayEditDialog = false;
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error updating order'
        });
      }
    });
  }

  confirmCancelOrder(order: OrderResponse) {
    if (order.status === 'CANCELLED') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Order is already cancelled'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to cancel order ${order.orderNumber}?`,
      header: 'Confirm Cancellation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.cancelOrder(order);
      }
    });
  }

  cancelOrder(order: OrderResponse) {
    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Order cancelled successfully'
        });
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error cancelling order'
        });
      }
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SHIPPED':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'SHIPPED':
        return 'Shipped';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Customer not found';
  }

  getCustomerEmail(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.email : '';
  }

  canCancelOrder(order: OrderResponse): boolean {
    return order.status !== 'CANCELLED' && order.status !== 'DELIVERED';
  }

  canEditOrder(order: OrderResponse): boolean {
    return order.status !== 'CANCELLED' && order.status !== 'DELIVERED';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  getProductsCount(order: OrderResponse): number {
    return order.products.reduce((total, product) => total + product.quantity, 0);
  }

  getPendingOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status === 'PENDING').length;
  }

  getShippedOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status === 'SHIPPED').length;
  }

  getDeliveredOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status === 'DELIVERED').length;
  }

  getCancelledOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status === 'CANCELLED').length;
  }
}
