import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CarouselModule } from 'primeng/carousel';
import { ProductsService } from '../../services/products.service';
import { Router } from '@angular/router';

//ngstyle
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  imports: [
    ButtonModule,
    TagModule,
    CarouselModule,
    CommonModule

  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(
    private productsService: ProductsService,
    private router: Router
  ) {}


  productsInfo : any[] = []; 

    responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];





  title = 'Lucho Express';
  titles: string[] = ["We create", "We build", "We innovate", "We are Lucho Express"];
  currentTitle: string = this.titles[0];
  currentIndex: number = 0;



  ngOnInit(): void {
    this.productsService.getAllProducts().subscribe({
      next: (data: any) => {
        console.log('products: ', data);
        this.productsInfo = Array.isArray(data) ? data : [];
      },
      error: (error) => {
        console.log('error: ', error);
        this.productsInfo = []; // Asegurar que siempre sea un array
      }
    });

    // this.inventoryService.getProducts().subscribe((data : any) => {
    //   console.log('products: ',data);
    //   this.productsInfo = data.data.products;
    // }, (error) => {
    //   console.log('error: ',error);
    // })


    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.titles.length;
      this.currentTitle = this.titles[this.currentIndex];
    }, 2000);
  }

  /**
   * Navegar a la vista de productos con el producto seleccionado
   */
  goToProduct(product: any): void {
    if (product && product.id) {
      this.router.navigate(['/products', product.id]);
    } else {
      // Si no hay ID, ir a la vista general de productos
      this.router.navigate(['/products']);
    }
  }

  
}