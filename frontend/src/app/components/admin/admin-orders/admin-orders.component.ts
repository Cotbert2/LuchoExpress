import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Order Management</h1>
      <p class="text-gray-600">Manage all orders, track shipments, and update statuses</p>
      <!-- TODO: Implement order management functionality -->
    </div>
  `,
  styles: []
})
export class AdminOrdersComponent {

}
