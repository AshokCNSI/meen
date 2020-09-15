import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RatingsellerPage } from './ratingseller.page';

const routes: Routes = [
  {
    path: '',
    component: RatingsellerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RatingsellerPageRoutingModule {}
