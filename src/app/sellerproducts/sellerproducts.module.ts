import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SellerproductsPageRoutingModule } from './sellerproducts-routing.module';

import { SellerproductsPage } from './sellerproducts.page';
import { StarRatingModule } from 'ionic5-star-rating';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SellerproductsPageRoutingModule,
	StarRatingModule
  ],
  declarations: [SellerproductsPage]
})
export class SellerproductsPageModule {}
