import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyaddressPage } from './myaddress.page';

const routes: Routes = [
  {
    path: '',
    component: MyaddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyaddressPageRoutingModule {}
