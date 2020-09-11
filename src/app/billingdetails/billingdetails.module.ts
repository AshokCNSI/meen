import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BillingdetailsPageRoutingModule } from './billingdetails-routing.module';

import { BillingdetailsPage } from './billingdetails.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BillingdetailsPageRoutingModule
  ],
  declarations: [BillingdetailsPage]
})
export class BillingdetailsPageModule {}
