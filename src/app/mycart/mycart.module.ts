import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MycartPageRoutingModule } from './mycart-routing.module';

import { MycartPage } from './mycart.page';
import { StarRatingModule } from 'ionic5-star-rating';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MycartPageRoutingModule,
	StarRatingModule
  ],
  declarations: [MycartPage]
})
export class MycartPageModule {}
