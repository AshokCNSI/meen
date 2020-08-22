import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationassignerPageRoutingModule } from './locationassigner-routing.module';

import { LocationassignerPage } from './locationassigner.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationassignerPageRoutingModule
  ],
  declarations: [LocationassignerPage]
})
export class LocationassignerPageModule {}
