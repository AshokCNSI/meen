import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SellerproductsPage } from './sellerproducts.page';

const routes: Routes = [
  {
    path: '',
    component: SellerproductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SellerproductsPageRoutingModule {}
