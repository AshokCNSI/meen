import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyassignmentsPageRoutingModule } from './myassignments-routing.module';

import { MyassignmentsPage } from './myassignments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyassignmentsPageRoutingModule
  ],
  declarations: [MyassignmentsPage]
})
export class MyassignmentsPageModule {}
