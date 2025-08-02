import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-center mb-6">Bienvenido a Lucho Express</h1>
      <div class="max-w-4xl mx-auto">
        <p class="text-lg text-gray-600 text-center mb-8">
          Tu plataforma de delivery favorita
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-3">Comida Rápida</h3>
            <p class="text-gray-600">Encuentra tus restaurantes favoritos</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-3">Entrega Rápida</h3>
            <p class="text-gray-600">Recibe tu pedido en minutos</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-3">Mejor Precio</h3>
            <p class="text-gray-600">Ofertas y promociones exclusivas</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent {

}
