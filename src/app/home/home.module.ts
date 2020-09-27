import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import {MatBadgeModule} from '@angular/material/badge';
import { StarRatingModule } from 'ionic5-star-rating';
import { PipesModule } from '../pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
	MatBadgeModule,
	StarRatingModule,
	PipesModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
