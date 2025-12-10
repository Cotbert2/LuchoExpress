# Personal Shopper Module - Installation Guide

## Instalación de dependencias

Para que el módulo de Personal Shopper funcione correctamente, necesitas instalar Socket.IO client:

```bash
cd /Users/mateogarcia/Development/LuchoExpress/lucho-express-mobile
npm install socket.io-client
```

## Estructura del módulo

```
src/app/personal-shopper/
├── orders/              # Lista de órdenes asignadas
│   ├── orders.page.ts
│   ├── orders.page.html
│   └── orders.page.scss
├── order-detail/        # Detalle de orden con productos y cliente
│   ├── order-detail.page.ts
│   ├── order-detail.page.html
│   └── order-detail.page.scss
└── chat/                # Chat en tiempo real con cliente
    ├── chat.page.ts
    ├── chat.page.html
    └── chat.page.scss
```

## Servicios creados

### PersonalShopperService
- `getMyOrders()` - Obtiene órdenes asignadas al PS autenticado
- `getOrderById(orderId)` - Obtiene detalles de una orden
- `updateOrderStatus(orderId, status)` - Actualiza estado de orden
- `getOrderMessages(orderId)` - Obtiene historial de chat
- `sendMessage(messageDto)` - Envía mensaje al cliente

### Interfaces
- `Order` - Modelo de orden completo
- `OrderStatus` - Estados: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- `PersonalShopper` - Modelo de personal shopper
- `Message` - Modelo de mensaje de chat
- `MessageType` - Tipos: TEXT, IMAGE, LOCATION, SYSTEM

## Rutas protegidas

Todas las rutas del personal shopper están protegidas con `personalShopperGuard`:

- `/personal-shopper/orders` - Lista de órdenes
- `/personal-shopper/order/:id` - Detalle de orden
- `/personal-shopper/chat/:orderId` - Chat con cliente

## Flujo de trabajo del Personal Shopper

1. **Login** → Si el rol es `PS`, redirige a `/personal-shopper/orders`
2. **Ver órdenes** → Lista ordenada por estado (pendientes primero)
3. **Ver detalle** → Información completa de orden, cliente y productos
4. **Actualizar estado** → Flujo obligatorio: PENDING → CONFIRMED → SHIPPED → DELIVERED
5. **Chat** → Comunicación en tiempo real con el cliente usando WebSocket

## Configuración del backend

Asegúrate de que el API Gateway y ms-chat estén corriendo:

```bash
# ms-order (Puerto 8080 a través del gateway)
GET    /api/orders/personal-shopper/my-orders
PATCH  /api/orders/{orderId}/status

# ms-chat (Puerto 3000)
GET    /api/personal-shoppers/by-user/{userId}
GET    /api/messages/order/{orderId}
POST   /api/messages
WebSocket en puerto 3000
```

## Características implementadas

✅ Autenticación JWT con rol PS
✅ Lista de órdenes asignadas con filtros
✅ Detalle completo de orden
✅ Actualización de estado con validaciones
✅ Chat en tiempo real con Socket.IO
✅ Interfaz responsiva con Ionic + Tailwind
✅ Guards de protección de rutas
✅ Manejo de errores y estados de carga
