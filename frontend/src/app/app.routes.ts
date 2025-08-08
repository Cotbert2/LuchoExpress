import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent)
  },
  // Solo USERS pueden entrar a productos
  {
    path: 'products',
    loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent),
    canActivate: [AuthGuard, UserGuard]
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent),
    canActivate: [AuthGuard, UserGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [AuthGuard, UserGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'order',
    loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [AuthGuard, UserGuard]
  },
  // Solo ADMIN/ROOT pueden entrar al panel admin
  {
    path: 'admin/products',
    loadComponent: () => import('./components/admin/admin-products/admin-products.component').then(m => m.AdminProductsComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./components/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./components/admin/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
