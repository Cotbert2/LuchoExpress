import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule, 
    InputNumberModule, 
    ButtonModule, 
    ImageModule,
    PanelModule,
    TableModule,
    RatingModule,
    FormsModule
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  @Input() product: any;
  @Output() addToCartEvent = new EventEmitter<any>();

  
  tableData : any = [];
  productDescription : any = {};
  cuantity : number = 1;


  rating: number = 3;
  stock: number = 10;

  ngOnInit(): void {
    this.rating = this.generateRandomNumber(3,5);
    this.stock = this.generateRandomNumber(1,50);
    console.log('product: ',this.product);
    this.productDescription = JSON.parse(this.product.description);
    console.log('productDescription: ',this.productDescription);
    this.tableData = Object.entries(this.productDescription).map(([key, value]) => ({ key, value }));
  }

  addToCart() : void{
    const itemToCard = {
      product: this.product,
      cuantity: this.cuantity
    };
    console.log('new ited selected',itemToCard);
    this.addToCartEvent.emit(itemToCard);
  }


  generateRandomNumber(min : number = 1, max: number = 5): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  

}
