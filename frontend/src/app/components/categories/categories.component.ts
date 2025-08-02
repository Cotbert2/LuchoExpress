import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-center mb-6">Categorías</h1>
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div class="text-4xl mb-3">🍕</div>
            <h3 class="text-lg font-semibold">Pizza</h3>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div class="text-4xl mb-3">🍔</div>
            <h3 class="text-lg font-semibold">Hamburguesas</h3>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div class="text-4xl mb-3">🌮</div>
            <h3 class="text-lg font-semibold">Mexicana</h3>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div class="text-4xl mb-3">🍱</div>
            <h3 class="text-lg font-semibold">Asiática</h3>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div class="text-4xl mb-3">🥗</div>
            <h3 class="text-lg font-semibold">Saludable</h3>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div class="text-4xl mb-3">🍰</div>
            <h3 class="text-lg font-semibold">Postres</h3>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div class="text-4xl mb-3">☕</div>
            <h3 class="text-lg font-semibold">Bebidas</h3>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div class="text-4xl mb-3">🍗</div>
            <h3 class="text-lg font-semibold">Pollo</h3>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CategoriesComponent {

}
