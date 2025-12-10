import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, bagOutline, cubeOutline, cartOutline, personOutline, listOutline, documentTextOutline, chatbubbleOutline } from 'ionicons/icons';
import { CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    IonApp, 
    IonTabs, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel, 
    IonBadge
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  cartItemsCount = 0;
  isPersonalShopper = false;
  private cartSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {
    addIcons({ homeOutline, bagOutline, cubeOutline, cartOutline, personOutline, listOutline, documentTextOutline, chatbubbleOutline });
  }

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    // Subscribe to auth changes to detect personal shopper role
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isPersonalShopper = user?.role === 'PS';
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
