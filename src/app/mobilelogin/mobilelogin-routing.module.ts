import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MobileloginPage } from './mobilelogin.page';

const routes: Routes = [
  {
    path: '',
    component: MobileloginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MobileloginPageRoutingModule {}
