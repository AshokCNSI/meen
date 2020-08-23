import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationmapPageRoutingModule } from './locationmap-routing.module';

import { LocationmapPage } from './locationmap.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationmapPageRoutingModule
  ],
  declarations: [LocationmapPage]
})
export class LocationmapPageModule {}
