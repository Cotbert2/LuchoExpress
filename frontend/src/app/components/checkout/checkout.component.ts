import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-center mb-6">Carrito de Compras</h1>
      <div class="max-w-4xl mx-auto">
        
        <!-- Empty cart state -->
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🛒</div>
          <h2 class="text-2xl font-semibold mb-3 text-gray-700">Tu carrito está vacío</h2>
          <p class="text-gray-500 mb-6">¡Agrega algunos productos deliciosos!</p>
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
            Explorar Productos
          </button>
        </div>

        <!-- Cart items would go here when items are added -->
        
      </div>
    </div>
  `,
  styles: []
})
export class CheckoutComponent {

}
