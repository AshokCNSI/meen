import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockdetailPageRoutingModule } from './stockdetail-routing.module';

import { StockdetailPage } from './stockdetail.page';
import { StarRatingModule } from 'ionic5-star-rating';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
	ReactiveFormsModule,
    IonicModule,
    StockdetailPageRoutingModule,
	StarRatingModule
  ],
  declarations: [StockdetailPage]
})
export class StockdetailPageModule {}
