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
  {
    path: 'chat/:orderId',
    loadComponent: () => import('./personal-shopper/chat/chat.page').then((m) => m.ChatPage),
  },
  {
    path: 'personal-shopper',
    canActivate: [() => import('./guards/personal-shopper.guard').then(m => m.personalShopperGuard)],
    children: [
      {
        path: 'orders',
        loadComponent: () => import('./personal-shopper/orders/orders.page').then((m) => m.OrdersPage),
      },
      {
        path: 'order/:id',
        loadComponent: () => import('./personal-shopper/order-detail/order-detail.page').then((m) => m.OrderDetailPage),
      },
      {
        path: 'chat/:orderId',
        loadComponent: () => import('./personal-shopper/chat/chat.page').then((m) => m.ChatPage),
      },
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full'
      }
    ]
  },
];
