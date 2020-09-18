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
import { MobileloginPage } from '../mobilelogin/mobilelogin.page';
import { LocationserviceService } from '../locationservice.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.page.html',
  styleUrls: ['./customerdetails.page.scss'],
})
export class CustomerdetailsPage implements OnInit {
  
  
  constructor(public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  public formBuilder: FormBuilder, 
  private navController: NavController, 
  private router: Router, 
  private authService: AuthenticateService,
  private menuCtrl : MenuController,
  public loading: LoadingService,
  public modalController: ModalController,
  private locationService: LocationserviceService,
  private navParams: NavParams) { 
	this.pagemode = this.navParams.data.pagemode;
  }

  ngOnInit() {
	  this.menuCtrl.enable(false);
  }
  
  ionViewWillLeave() {
    
  }
  
  ionViewDidLoad() {
	  
	}
  
  isSubmitted = false;
  firebaseErrors = false;
  firebaseErrorMessage = "";
  pagemode : string;
  email : string;
  firstname : string;
  lastname : string;
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
      email: ['', [Validators.required, Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')]],
	  firstname: ['', [Validators.required, Validators.maxLength(50)]],
	  lastname: ['', [Validators.required, Validators.maxLength(50)]],
  });
	
  get errorControl() {
	return this.formData.controls;
  }
  
save(form){
	 this.isSubmitted = true;
	  if (!this.formData.valid) {
		return false;
	  } else {
		  this.authService.userDetails().subscribe(res => { 
			if (res !== null) {
				firebase.database().ref('/profile/'+res.uid).set({
					"firstname" : this.formData.value.firstname,
					"lastname" : this.formData.value.lastname,
					"email" : this.formData.value.email,
					"mobilenumber": res.phoneNumber,
					"usertype" : "C",
					"createddate": new Date().toLocaleString(),
					"createdby":res.uid,
					"modifieddate": new Date().toLocaleString(),
					"modifiedby":res.uid
				}).then(res =>  {
				   if(this.pagemode == 'M') {
						this.modalController.dismiss();
						this.locationService.setUserData();
					} else {
						this.navController.navigateRoot('/home');
					}
			   }
			 ).catch(error => {
				this.presentAlert('Error',error);
			  });
			} 
		  }, err => {
			  console.log('err', err);
		 })
		  
	  }
	}
	
	loginMobile() {
		if(this.pagemode == 'M') {
			setTimeout(() => {
				// Close modal
				this.modalController.dismiss();
			}, 500);
			this.openMobileLogin();
		} else {
			this.navController.navigateRoot('/mobilelogin');
		}
	}
	
	async openMobileLogin() {
		const modal = await this.modalController.create({
		  component: MobileloginPage,
		  cssClass: 'my-custom-class',
		  componentProps: {
			pagemode : 'M'
		  }
		});
		await modal.present();
	  }
}

