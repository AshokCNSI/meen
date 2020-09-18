import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MobileloginPageRoutingModule } from './mobilelogin-routing.module';

import { MobileloginPage } from './mobilelogin.page';
import {MatSnackBarModule} from '@angular/material/snack-bar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
	ReactiveFormsModule,
    IonicModule,
    MobileloginPageRoutingModule,
	MatSnackBarModule
  ],
  declarations: [MobileloginPage]
})
export class MobileloginPageModule {}
