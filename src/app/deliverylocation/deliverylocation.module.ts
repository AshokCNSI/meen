import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliverylocationPageRoutingModule } from './deliverylocation-routing.module';

import { DeliverylocationPage } from './deliverylocation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliverylocationPageRoutingModule
  ],
  declarations: [DeliverylocationPage]
})
export class DeliverylocationPageModule {}
