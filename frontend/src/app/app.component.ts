import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {
    // Initialization logic can go here
  }
  title = 'Lucho Express';




  changeView(view: string): void {
    console.log('Navigating to:', view);
    this.router.navigate([view]);
  }
  itemInCart: any = [];

}
