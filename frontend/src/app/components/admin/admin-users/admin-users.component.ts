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
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UserService, UserResponse, CreateUserRequest, UserFilters } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

interface RoleOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-admin-users',
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
    PasswordModule,
    CheckboxModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  loading = false;
  
  // Filtros
  filters: UserFilters = {};
  roleOptions: RoleOption[] = [
    { label: 'All roles', value: '' },
    { label: 'ROOT', value: 'ROOT' },
    { label: 'ADMIN', value: 'ADMIN' },
    { label: 'USER', value: 'USER' }
  ];
  emailFilter = '';
  
  // Dialogs
  displayCreateDialog = false;
  
  // Forms
  createUserForm: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
    role: 'USER'
  };
  
  selectedUser: UserResponse | null = null;
  
  // Usuario actual
  currentUser: UserResponse | null = null;
  availableRoles: string[] = [];
  availableRoleOptions: RoleOption[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadUsers();
  }

  loadCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.availableRoles = this.userService.getAvailableRoles(user.role);
        this.availableRoleOptions = [
          { label: 'USER', value: 'USER' },
          { label: 'ADMIN', value: 'ADMIN' },
          { label: 'ROOT', value: 'ROOT' }
        ].filter(option => this.availableRoles.includes(option.value));
      }
    });
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar usuarios'
        });
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filters.role = this.filters.role || '';
    this.filters.email = this.emailFilter;
    
    this.filteredUsers = this.userService.filterUsers(this.users, this.filters);
  }

  onRoleFilterChange() {
    this.applyFilters();
  }

  onEmailFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.filters = {};
    this.emailFilter = '';
    this.filteredUsers = [...this.users];
  }

  openCreateDialog() {
    this.createUserForm = {
      username: '',
      email: '',
      password: '',
      role: 'USER'
    };
    this.displayCreateDialog = true;
  }

  createUser() {
    if (!this.validateCreateForm()) {
      return;
    }

    console.log('Creating user with data:', this.createUserForm);

    this.userService.createUser(this.createUserForm).subscribe({
      next: (user) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User created successfully'
        });
        this.displayCreateDialog = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        
        let errorMessage = 'Error creating user';
        
        // Handle specific validation errors
        if (error.error && error.error.fieldErrors) {
          const fieldErrors = error.error.fieldErrors;
          const errorMessages = [];
          
          for (const field in fieldErrors) {
            if (fieldErrors[field] && fieldErrors[field].length > 0) {
              errorMessages.push(fieldErrors[field][0]);
            }
          }
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
          }
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Invalid user data';
        } else if (error.status === 409) {
          errorMessage = 'User or email already exists';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }

  confirmDisableUser(user: UserResponse) {
    if (user.role === 'ROOT') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'ROOT users cannot be deactivated'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate the user ${user.username}?`,
      header: 'Confirm deactivation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.disableUser(user);
      }
    });
  }

  disableUser(user: UserResponse) {
    this.userService.disableUser(user.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User deactivated successfully'
        });
        // Optimistic update
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx > -1) {
          this.users[idx] = { ...this.users[idx], enabled: false };
        }
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error disabling user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error deactivating user'
        });
      }
    });
  }

  activateUser(user: UserResponse) {
    this.userService.enableUser(user.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User activated successfully'
        });
        // Optimistic update
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx > -1) {
          this.users[idx] = { ...this.users[idx], enabled: true };
        }
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error activating user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error activating user'
        });
      }
    });
  }

  validateCreateForm(): boolean {
    // Username validation
    if (!this.createUserForm.username.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Username is required'
      });
      return false;
    }
    
    if (this.createUserForm.username.trim().length < 3 || this.createUserForm.username.trim().length > 50) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Username must be between 3 and 50 characters'
      });
      return false;
    }

    // Email validation
    if (!this.createUserForm.email.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Email is required'
      });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.createUserForm.email.trim())) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid email address'
      });
      return false;
    }
    
    if (this.createUserForm.email.trim().length > 100) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Email cannot exceed 100 characters'
      });
      return false;
    }

    // Password validation
    if (!this.createUserForm.password.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Password is required'
      });
      return false;
    }
    
    if (this.createUserForm.password.trim().length < 6 || this.createUserForm.password.trim().length > 100) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Password must be between 6 and 100 characters'
      });
      return false;
    }

    // Role validation
    if (!this.createUserForm.role) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Role is required'
      });
      return false;
    }

    return true;
  }

  getRoleSeverity(role: string): string {
    switch (role) {
      case 'ROOT':
        return 'danger';
      case 'ADMIN':
        return 'warning';
      case 'USER':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getStatusSeverity(enabled: boolean): string {
    return enabled ? 'success' : 'danger';
  }

  getStatusText(enabled: boolean): string {
    return enabled ? 'Active' : 'Inactive';
  }

  canCreateRole(role: string): boolean {
    return this.availableRoles.includes(role);
  }

  canDisableUser(user: UserResponse): boolean {
    return user.role !== 'ROOT' && this.currentUser?.id !== user.id;
  }
}
