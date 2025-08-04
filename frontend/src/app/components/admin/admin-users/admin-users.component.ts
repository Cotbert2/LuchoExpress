import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">User Management</h1>
      <p class="text-gray-600">Manage users, roles, and permissions</p>
      <!-- TODO: Implement user management functionality -->
    </div>
  `,
  styles: []
})
export class AdminUsersComponent {

}
