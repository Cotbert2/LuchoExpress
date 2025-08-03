import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppComponent } from '../app.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ShippingService } from '../services/shipping.service';
import { CatalogService } from '../services/catalog.service';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import {  ReactiveFormsModule } from '@angular/forms';
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';

//import regular expresion
import { PatternValidator } from '@angular/forms';
import { PaymentsService } from '../services/payments.service';
import { RadioButtonModule } from 'primeng/radiobutton';



@Component({
  selector: 'app-checkout',
  imports: [
    StepperModule,
    ButtonModule,
    FormsModule,
    CommonModule,
    FloatLabelModule,
    InputTextModule,
    SelectModule,
    DataViewModule,
    DividerModule,
    InputNumberModule,
    RadioButtonModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit{

  isCheckoutSuccess : boolean = false;

  @Input() cartItems : any = {};
  @Output() checkoutEvent = new EventEmitter<any>();
  @Output() onSuccessfulCheckout = new EventEmitter<boolean>();
  

  session : any = {};
  countryCatalog : any = {};

  isValidAddressData : boolean = false;

  isValidGiftCard : boolean = false;


  placesId : any = {}
  shippingData : any = {};



  customerData : any = {
    name: "",
    phone: "",
    identification: "",
    user : ""
  }

  paymentOptions : any = [
    {label: 'Card', value: 'card'},
    {label: 'Gift Card', value: 'giftCard'},
    {label: 'Paypal', value: 'paypal'},
  ]

  customerCreated : boolean = false;

  countryComboConfig : any = {};
  currentPayment : string = "";
  cardData : any = {};

  customerCreatedData : any = {};


  giftCard : string = "";

  userPaymentMethods : any = {};

  selectedPaymentMethod : any = {};

  validatePaymentData : boolean = false;


  constructor(
    private appComponent : AppComponent,
    private messageService : MessageService,
    private shippingService : ShippingService,
    private catalogService : CatalogService,
    private paymentService : PaymentsService
  ){
  }

  ngOnInit(): void {
    this.catalogService.getCountryCatalog()
    .subscribe((data : any) => {
      console.log('country catalog: ',data.data);
      this.countryCatalog = data;
      this.countryComboConfig = data.data.countries
      .map((country : any) => {
        return {
          label: country.name,
          value: country.states.map((state : any) => {
            return {
              label: state.name,
              value: state.cities.map((city : any) => {
                return {
                  label: city.name,
                  value: city.id
                }
              })
            }
          })
        }
      });

      console.log('countryComboConfig: ',this.countryComboConfig);
    },
    (error) => {
      console.log('error: ',error);
    });

    
    console.log('cartItems: ',this.cartItems);
    
    this.session = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    console.log('session: ',this.session);
    this.customerData.user = this.session.id;

    this.updateUserPaymentMethods();

  }

  changeCurrentView(view: string) : void {
    this.appComponent.currentView = view;
  }

  validateCustomerData() : boolean{
    if(this.customerData.name == "" || this.customerData.phone == "" || this.customerData.identification == ""){
      return false;
    }


    return true;

  }

  createCustomer() : void {
    this.shippingService.createCustomer(this.customerData).subscribe((data : any) => {
      console.log('customer created: ',data);
      this.messageService.add({severity:'success', summary:'Success', detail:'Customer created'});
      this.customerCreatedData = data;
      this.customerCreated = true;
    },
    (error) => {
      console.log('error: ',error);
      this.messageService.add({severity:'error', summary:'Error', detail:'Error creating customer'});
    })


  }

  validateShippingData() : boolean {
    if(!this.shippingData.street1 || !this.shippingData.street2
      || !this.shippingData.zipCode || !this.placesId.cityId
    ){
      return false;
    }
    return true;
  }


  

  removeItem(item: any) : void {
    const index = this.cartItems.indexOf(item);
    this.cartItems.splice(index, 1);
  }

  payWithPaypal() : void {
    console.log('paying with paypal');
  }

  validateCardData() : boolean {
    if(!this.cardData.name || !this.cardData.number || !this.cardData.expiration || !this.cardData.cvv){
      return false;
    }

    if(this.cardData.number.length != 16){
      return false;
    }

    if(this.cardData.cvv.length != 3){
      return false;
    }

    //expiration date format: MM/YY use regex
    if (this.cardData.expiration.length != 5

      || !/^\d{2}\/\d{2}$/.test(this.cardData.expiration)
    ){
      return false;
    }




    return true;
  }

  validateGiftCard() : boolean {
    if(!this.giftCard || this.giftCard.length != 36){
      return false;
    }

    return true;
  }


  registerGiftCard() : void {
    const dataToSend = {
      user: this.session.id,
      giftCardNumber: this.giftCard
    };
    this.paymentService.registerGiftCard(
      dataToSend
    ).subscribe((data : any) => {
      console.log('gift card registered: ',data);
      this.messageService.add({severity:'success', summary:'Success', detail:'Gift card registered'});
      this.isValidGiftCard = true;
      
      setTimeout(() => {
        this.updateUserPaymentMethods();
      }, 3000);

    },
    (error) => {
      console.log('error: ',error);
      this.messageService.add({severity:'error', summary:'Error', detail:'Error registering gift card'});
    });


    
  }

  registerCard() : void {
    const dataToSend = {
      creditCardName: this.cardData.name,
      creditCardNumber: this.cardData.number,
      creditCardExpirationDate: this.cardData.expiration,
      creditCardCVC: this.cardData.cvv,
      user: this.session.id
    };
    this.paymentService.registerCard(dataToSend)
    .subscribe((data : any) => {
      console.log('card registered: ',data);
      this.messageService.add({severity:'success', summary:'Success', detail:'Card registered'});
      this.updateUserPaymentMethods();
    },
    (error) => {
      console.log('error: ',error);
      this.messageService.add({severity:'error', summary:'Error', detail:'Error registering card'});
    });
    
  }

  updateUserPaymentMethods() : void {
    console.log('updating payment methods');
    this.paymentService.getUserPaymentMethods(this.session.id).subscribe
    ((data : any) => {
      this.userPaymentMethods = data.data;
      console.log('payment methods: ',data);
    },
    (error) => {
      console.log('error: ',error);
    });
  }

  getLast6Digits(cardNumber : string) : string {
    return cardNumber.slice(-6);
  }

  pay(){
    const dataToSend = {
      address: this.shippingData.street1 + ';' + this.shippingData.street2 + ';' + this.placesId.cityId,
      zipCode: this.shippingData.zipCode,
      contactPhone: this.customerData.phone,
      city: this.placesId.cityId,
      paymentMethod: this.selectedPaymentMethod.id,
      products: this.cartItems.map((item : any) => {
        return { 
          product: item.product.id,
          quantity: item.cuantity
        }
      }),
      //products: { product: null, quantity: null }
      customer: this.customerCreatedData.data.createCustomer.id
    };
    console.log('data to send: ',dataToSend);

    this.shippingService.generateShipping(dataToSend).subscribe((data : any) => {
      console.log('shipping generated: ',data);
      this.messageService.add({severity:'success', summary:'Success', detail:'Shipping generated'});
      this.isCheckoutSuccess = true;
      this.onSuccessfulCheckout.emit(true);
      this.checkoutEvent.emit();
    },
    (error) => {
      console.log('error: ',error);
      this.messageService.add({severity:'error', summary:'Error', detail:'Error generating shipping'});
    });
  }

  

  


}
