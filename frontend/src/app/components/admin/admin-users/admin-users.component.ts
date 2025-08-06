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

import { UserService, UserResponse, CreateUserRequest, UpdateUserRequest, UserFilters } from '../../../services/user.service';
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
  displayEditDialog = false;
  
  // Forms
  createUserForm: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
    role: 'USER'
  };
  
  editUserForm: UpdateUserRequest = {};
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

  openEditDialog(user: UserResponse) {
    this.selectedUser = user;
    this.editUserForm = {
      username: user.username,
      email: user.email,
      role: user.role,
      enabled: user.enabled
    };
    this.displayEditDialog = true;
  }

  createUser() {
    if (!this.validateCreateForm()) {
      return;
    }

    this.userService.createUser(this.createUserForm).subscribe({
      next: (user) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario creado correctamente'
        });
        this.displayCreateDialog = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear usuario'
        });
      }
    });
  }

  updateUser() {
    if (!this.selectedUser || !this.validateEditForm()) {
      return;
    }

    this.userService.updateUser(this.selectedUser.id, this.editUserForm).subscribe({
      next: (user) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario actualizado correctamente'
        });
        this.displayEditDialog = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar usuario'
        });
      }
    });
  }

  confirmDisableUser(user: UserResponse) {
    if (user.role === 'ROOT') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Los usuarios ROOT no se pueden desactivar'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea desactivar al usuario ${user.username}?`,
      header: 'Confirmar desactivación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
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
          summary: 'Éxito',
          detail: 'Usuario desactivado correctamente'
        });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error disabling user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al desactivar usuario'
        });
      }
    });
  }

  validateCreateForm(): boolean {
    if (!this.createUserForm.username.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre de usuario es requerido'
      });
      return false;
    }

    if (!this.createUserForm.email.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El email es requerido'
      });
      return false;
    }

    if (!this.createUserForm.password.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña es requerida'
      });
      return false;
    }

    return true;
  }

  validateEditForm(): boolean {
    if (!this.editUserForm.username?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre de usuario es requerido'
      });
      return false;
    }

    if (!this.editUserForm.email?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El email es requerido'
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
    return enabled ? 'Activo' : 'Inactivo';
  }

  canCreateRole(role: string): boolean {
    return this.availableRoles.includes(role);
  }

  canDisableUser(user: UserResponse): boolean {
    return user.role !== 'ROOT' && this.currentUser?.id !== user.id;
  }
}
