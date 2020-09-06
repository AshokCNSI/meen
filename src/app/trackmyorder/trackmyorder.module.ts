import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackmyorderPageRoutingModule } from './trackmyorder-routing.module';

import { TrackmyorderPage } from './trackmyorder.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackmyorderPageRoutingModule
  ],
  declarations: [TrackmyorderPage]
})
export class TrackmyorderPageModule {}
