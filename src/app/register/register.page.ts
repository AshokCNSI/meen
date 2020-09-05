import { Component, OnInit, Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import{ Validators, FormBuilder, FormGroup, FormControl }from'@angular/forms';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { AuthenticateService } from '../authentication.service';
import {  MenuController } from '@ionic/angular';
import { LoadingService } from '../loading.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})


export class RegisterPage implements OnInit {

  constructor(
  public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  private authService: AuthenticateService,
  public formBuilder: FormBuilder, 
  private navController: NavController, 
  private router: Router,
  private menuCtrl : MenuController,
  public loading: LoadingService) { }

  enableseller : string;
  ngOnInit() {
	this.usertype = "C";
	this.menuCtrl.enable(false);
	firebase.database().ref('/properties/States').orderByChild('state_name').once('value').then((snapshot) => {
		this.loading.present();
		  this.stateList = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			this.stateList.push(a);
		  })
		  this.loading.dismiss();
	  }).catch((error: any) => {
		this.loading.dismiss();
	});
	
	firebase.database().ref('/properties/prop').once('value').then((snapshot) => {
		this.loading.present();
		this.enableseller = snapshot.child('enableseller').val();
		  this.loading.dismiss();
	  }).catch((error: any) => {
		this.loading.dismiss();
	});
  }
  
  ionViewWillLeave() {
    
  }
  
  isSubmitted = false;
  firebaseErrors = false;
  firebaseErrorMessage = "";
  email : string;
  password : string;
  usertype : string;
  firstname: string; 
  lastname : string;
  mobilenumber : number;
  street1 : string;
  street2 : string = "";
  stateCode : string = "";
  district : string;
  state : string;
  pincode : number;
  spinnerShow = false;
  stateList = [];
  locationList = [];
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
      buttons: [{
          text: 'Ok',
          handler: () => {
            if(status == 'Success') {
				
			}
	  }}]
    });
    await alert.present();
  }

  formData = this.formBuilder.group({
       email: ['', [Validators.required, Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')]],
	   password: ['', [Validators.required, Validators.minLength(8)]],
	   firstname: ['', [Validators.required]],
	   lastname: ['', [Validators.required]],
	   usertype: ['', [Validators.required]],
	   shopname: ['', this.usertype == 'S' ? [Validators.required] : []],
	   mobilenumber: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')])],
	   street1: ['', [Validators.required]],
	   street2: ['', []],
	   district: ['', [Validators.required]],
	   state: ['', [Validators.required]],
	   pincode: ['', [Validators.required, ,Validators.pattern('^[0-9]+$')]]
	});
	
	get errorControl() {
		return this.formData.controls;
	  }
  
  register(form) {
	  this.isSubmitted = true;
	  if (!this.formData.valid) {
		return false;
	  } else {
		this.spinnerShow = true;
		firebase.auth().createUserWithEmailAndPassword(this.formData.value.email, this.formData.value.password)
		.then((result) => {
			this.profileCreation(result.user.uid)
		}).catch((error) => {
			this.spinnerShow = false;
			this.presentAlert('Error',error.message);
		});
	  }
  }
  
  usertTypeSelect(event) {
    this.usertype = event.detail;
  }
  
  profileCreation(uid) {
	this.loading.present();
    firebase.database().ref('/profile/'+uid).set({
	   firstname: this.formData.value.firstname,
	   lastname: this.formData.value.lastname,
	   usertype: this.usertype,
	   mobilenumber: this.formData.value.mobilenumber,
	   shopname: this.formData.value.shopname,
	   street1: this.formData.value.street1,
	   street2: this.formData.value.street2,
	   district: this.formData.value.district,
	   state: this.formData.value.state,
	   pincode: this.formData.value.pincode,
	   createddate : Date(),
	   createdby:uid,
	   modifieddate : Date(),
	   modifiedby:uid,
	 })
	 .then(
	   res => 
	   {
		   this.authService.setUserName(this.formData.value.firstname+" "+this.formData.value.lastname);	
		   this.authService.userDetails().subscribe(res => { 
			  if (res !== null) {
				this.authService.setUserID(res.uid);
				this.authService.setEmailID(res.email);
				this.authService.setIsUserLoggedIn(true);
				firebase.database().ref('/profile/'+res.uid).once('value').then((snapshot) => {
					if(snapshot != null) {
						this.authService.setUserType(snapshot.child('usertype').val()); 					
					}
				});
			  } else {
				 this.authService.setIsUserLoggedIn(false); 
			  }
			  this.loading.dismiss();
			}, err => {
			  console.log('err', err);
			  this.loading.dismiss();
			})
			this.loading.dismiss();
		   this.presentAlert('Success','Congrats, User successfully created.');
	   },
	   err => {
		   this.presentAlert('Error',err);
		   this.loading.dismiss();
	   }
	 )
  }
  
  selectState($event) {
	  this.state = $event.target.value;
	  firebase.database().ref('/properties/location/'+this.state).once('value').then((snapshot) => {
		  this.locationList = [];
		  this.loading.present();
		  snapshot.forEach(item => {
			let a = item.toJSON();
			if(a['available'] == true) {
				this.locationList.push(a);
			}
		  })
		  this.loading.dismiss();
	  });
  }
	
}
