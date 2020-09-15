import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RatingsellerPageRoutingModule } from './ratingseller-routing.module';

import { RatingsellerPage } from './ratingseller.page';
import { StarRatingModule } from 'ionic5-star-rating';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
	ReactiveFormsModule,
    IonicModule,
    RatingsellerPageRoutingModule,
	StarRatingModule
  ],
  declarations: [RatingsellerPage]
})
export class RatingsellerPageModule {}
