import { Component, OnInit, Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import * as firebase from 'firebase';

import { AngularFireAuth } from '@angular/fire/auth';
import{ Validators, FormBuilder, FormGroup, FormControl }from'@angular/forms';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthenticateService } from '../authentication.service';
import {  MenuController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  public formBuilder: FormBuilder, 
  private navController: NavController, 
  private router: Router, 
  private authService: AuthenticateService,
  private menuCtrl : MenuController) { }

  ngOnInit() {
	  this.menuCtrl.enable(false);
  }
  
  ionViewWillLeave() {
    
  }
  
  isSubmitted = false;
  firebaseErrors = false;
  firebaseErrorMessage = "";
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
      buttons: ['Ok']
    });
    await alert.present();
  }

  formData = this.formBuilder.group({
       email: ['', [Validators.required, Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')]],
	   password: ['', [Validators.required, Validators.minLength(8)]],
	});
	
	get errorControl() {
		return this.formData.controls;
	  }
  
  login(form) {
	  this.isSubmitted = true;
	  if (!this.formData.valid) {
		return false;
	  } else {
		  
		this.authService.loginUser(this.formData.value.email, this.formData.value.password)
		  .then(res => {
			this.navController.navigateRoot('/home');
		  }, error => {
			this.presentAlert('Error',error.message);
		  })
	  }
  }
}
