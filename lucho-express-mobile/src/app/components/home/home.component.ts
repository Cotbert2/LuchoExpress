import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProductsService } from '../../services/products.service';
import { addIcons } from 'ionicons';
import { eyeOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  title = 'Lucho Express';
  titles: string[] = ['We create', 'We build', 'We innovate', 'We are Lucho Express'];
  currentTitle: string = this.titles[0];
  currentIndex: number = 0;

  productsInfo: any[] = [];

  // Swiper configuration to mimic the previous PrimeNG carousel behavior.
  slidesOptions = {
    slidesPerView: 1.2,
    spaceBetween: 12,
    loop: true,
    autoplay: { 
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: false
    },
    speed: 800,
    breakpoints: {
      640: { slidesPerView: 2 },
      960: { slidesPerView: 3 },
    },
  };

  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router,
  ) {
    addIcons({ eyeOutline });
  }

  ngOnInit(): void {
    this.productsService.getAllProducts().subscribe({
      next: (data: any) => {
        this.productsInfo = Array.isArray(data) ? data : [];
      },
      error: (error) => {
        console.log('error: ', error);
        this.productsInfo = []; // Ensure array shape to avoid template errors.
      },
    });

    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.titles.length;
      this.currentTitle = this.titles[this.currentIndex];
    }, 2000);
  }

  goToProduct(product: any): void {
    if (product?.id) {
      this.router.navigate(['/product', product.id]);
    } else {
      console.warn('Product ID not found');
    }
  }
}