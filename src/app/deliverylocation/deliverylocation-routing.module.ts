import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliverylocationPage } from './deliverylocation.page';

const routes: Routes = [
  {
    path: '',
    component: DeliverylocationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliverylocationPageRoutingModule {}
