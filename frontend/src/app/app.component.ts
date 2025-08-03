import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "./components/shared/footer/footer.component";
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterModule, ButtonModule,
    CommonModule,
    ButtonModule,
    ToolbarModule,
    AvatarModule,
    MenuModule,
    ToastModule,
    CardModule,
    CarouselModule,
    TagModule,
    FormsModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService]
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'Lucho Express';
  itemInCart: any[] = [];
  private cartSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private messageService: MessageService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.itemInCart = items;
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  changeView(view: string): void {
    console.log('Navigating to:', view);
    this.router.navigate([view]);
  }

  handleCartClick(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/checkout']);
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Iniciar sesión requerido',
        detail: 'Debes iniciar sesión para acceder al carrito de compras',
        life: 4000
      });
      
      console.log('Usuario no autenticado, redirigiendo al login');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
    }
  }

  isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

}
