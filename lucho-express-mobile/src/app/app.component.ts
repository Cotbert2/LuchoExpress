import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, bagOutline, cubeOutline, cartOutline, personOutline } from 'ionicons/icons';

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
export class AppComponent {
  cartItemsCount = 0;

  constructor() {
    addIcons({ homeOutline, bagOutline, cubeOutline, cartOutline, personOutline });
  }
}
