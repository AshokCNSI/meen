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
import {MatSnackBar} from '@angular/material/snack-bar';
import { CustomerdetailsPage } from '../customerdetails/customerdetails.page';

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
  private navParams: NavParams,
  private _snackBar: MatSnackBar) { 
	this.pagemode = this.navParams.data.pagemode;
  }

  ngOnInit() {
	  this.menuCtrl.enable(false);
	  this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
  }
  
  
  isSubmitted = false;
  firebaseErrors = false;
  firebaseErrorMessage = "";
  pagemode : string;
  phoneNumber : number;
  commonError = false;
  commonErrorMessage :  string;
  
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
      phoneNumber: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')])]
  });
	
  get errorControl() {
	return this.formData.controls;
  }
  
signIn(){
	 this.isSubmitted = true;
	  if (!this.formData.valid) {
		return false;
	  } else {
		  const appVerifier = this.recaptchaVerifier;
		  const phoneNumberString = "+91" + this.formData.value.phoneNumber;
		  firebase.auth().signInWithPhoneNumber(phoneNumberString, appVerifier)
			.then( async (confirmationResult) => {
			  // SMS sent. Prompt user to type the code from the message, then sign the
			  // user in with confirmationResult.confirm(code).
			  let prompt = await this.alertCtrl.create({
			  header: 'Enter the Confirmation code',
			  backdropDismiss : false,
			  inputs: [{ name: 'confirmationCode', placeholder: 'Confirmation Code' }],
			  buttons: [
				{ text: 'Cancel',
				  handler: data => { console.log('Cancel clicked'); }
				},
				{ text: 'Send',
				  handler: data => {
					confirmationResult.confirm(data.confirmationCode)
					.then((error: any) => {
					  this.authService.userDetails().subscribe(res => { 
						if (res !== null) {
							firebase.database().ref('/profile/'+res.uid).once('value').then((snapshot) => {
								if(snapshot != null) {
									if(!snapshot.toJSON()) {
										
										if(this.pagemode == 'M') {
											this.modalController.dismiss();
											this.openCustomerDetails();
										} else {
											this.navController.navigateRoot('/customerdetails');
										}
									} else {
										if(this.pagemode == 'M') {
											this.modalController.dismiss();
										} else {
											this.navController.navigateRoot('/home');
										}
									}
								}
							})
						} 
					  }, err => {
						  console.log('err', err);
					 })
					}).catch((error: any) => {
					  let snackBarRef = this._snackBar.open('Error', error.code,{
						  duration: 3000,
						  horizontalPosition: 'center',
						  verticalPosition: 'top',
						});
					});
				  }
				}
			  ]
			});
			await prompt.present();
		  })
		  .catch((error: any) => {
			  let snackBarRef = this._snackBar.open('Error', error.code,{
				  duration: 3000,
				  horizontalPosition: 'center',
				  verticalPosition: 'top',
				});
			  console.error("SMS not sent", error.code);
		  });
	  }
	}
	
	skipLogin() {
		if(this.pagemode == 'M') {
			this.modalController.dismiss();
		} else {
			this.navController.navigateRoot('/home');
		}
	}
	
	async openCustomerDetails() {
		const modal = await this.modalController.create({
		  component: CustomerdetailsPage,
		  cssClass: 'my-custom-class',
		  componentProps: {
			pagemode : 'M'
		  }
		});
		await modal.present();
	}
}
