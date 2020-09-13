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
import { ModalController, NavParams } from '@ionic/angular';
import { LoadingService } from '../loading.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-mobilelogin',
  templateUrl: './mobilelogin.page.html',
  styleUrls: ['./mobilelogin.page.scss'],
})
export class MobileloginPage implements OnInit {
  
  public recaptchaVerifier:firebase.auth.RecaptchaVerifier;
  
  constructor(public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  public formBuilder: FormBuilder, 
  private navController: NavController, 
  private router: Router, 
  private authService: AuthenticateService,
  private menuCtrl : MenuController,
  public loading: LoadingService,
  public modalController: ModalController,
  private navParams: NavParams) { 
	this.pagemode = this.navParams.data.pagemode;
  }

  ngOnInit() {
	  this.menuCtrl.enable(false);
  }
  
  ionViewWillLeave() {
    
  }
  
  ionViewDidLoad() {
	  this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
	}
  
  isSubmitted = false;
  firebaseErrors = false;
  firebaseErrorMessage = "";
  pagemode : string;
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : false,
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
  
	signIn(phoneNumber: number){
	  const appVerifier = this.recaptchaVerifier;
	  const phoneNumberString = "+" + phoneNumber;

	  firebase.auth().signInWithPhoneNumber(phoneNumberString, appVerifier)
		.then( confirmationResult => {
		  // SMS sent. Prompt user to type the code from the message, then sign the
		  // user in with confirmationResult.confirm(code).
		  console.log(confirmationResult);
	  })
	  .catch(function (error) {
		console.log("SMS not sent", error);
	  });

	}
}
