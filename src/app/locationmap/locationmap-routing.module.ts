import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationmapPage } from './locationmap.page';

const routes: Routes = [
  {
    path: '',
    component: LocationmapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocationmapPageRoutingModule {}
