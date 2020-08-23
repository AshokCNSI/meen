import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationassignerPage } from './locationassigner.page';

const routes: Routes = [
  {
    path: '',
    component: LocationassignerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocationassignerPageRoutingModule {}
