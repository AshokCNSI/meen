import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyassignmentsPage } from './myassignments.page';

const routes: Routes = [
  {
    path: '',
    component: MyassignmentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyassignmentsPageRoutingModule {}
