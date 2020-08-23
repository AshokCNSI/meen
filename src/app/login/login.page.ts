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
import { LoadingService } from '../loading.service';

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
  private menuCtrl : MenuController,
  public loading: LoadingService) { }

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
		this.loading.present();
		this.authService.loginUser(this.formData.value.email, this.formData.value.password)
		  .then(res => {
			this.loading.dismiss();
			if (res !== null) {
				this.authService.userDetails().subscribe(res => { 
				if (res !== null) {
					this.authService.setUserName(res.email);
					this.authService.setUserID(res.uid);
					this.authService.setEmailID(res.email);
					this.authService.setIsUserLoggedIn(true);
					firebase.database().ref('/profile/'+res.uid).once('value').then((snapshot) => {
						if(snapshot != null) {
							this.authService.setUserType(snapshot.child('usertype').val());  
							this.authService.setUserName(snapshot.child('firstname').val()+" "+snapshot.child('lastname').val());
							this.navController.navigateRoot('/home');
						}
					}).catch((error: any) => {
						this.loading.dismiss();
					});
				} else {
					this.authService.setIsUserLoggedIn(false);
				}
			  }, err => {
				  console.log('err', err);
			 })
			}
		  }, error => {
			this.loading.dismiss();
			this.presentAlert('Error',error.message);
		  })
	  }
  }
}
