import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackmyorderPageRoutingModule } from './trackmyorder-routing.module';

import { TrackmyorderPage } from './trackmyorder.page';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackmyorderPageRoutingModule,
	MatStepperModule
  ],
  declarations: [TrackmyorderPage]
})
export class TrackmyorderPageModule {}
