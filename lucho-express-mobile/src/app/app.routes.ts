import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./components/products/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./components/product/product.component').then((m) => m.ProductComponent),
  },
];
