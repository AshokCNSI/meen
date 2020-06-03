import { Component, OnInit, Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import{ Validators, FormBuilder, FormGroup, FormControl }from'@angular/forms';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { AuthenticateService } from '../authentication.service';

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
  private router: Router) { }

  ngOnInit() {
	this.usertype = "C";
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
  district : string;
  state : string;
  pincode : number;
  spinnerShow = false;
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
      buttons: [{
          text: 'Ok',
          handler: () => {
            if(status == 'Success') {
				this.navController.navigateRoot('/home');
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
    firebase.database().ref('/profile/'+uid).set({
	   firstname: this.formData.value.firstname,
	   lastname: this.formData.value.lastname,
	   usertype: this.usertype,
	   mobilenumber: this.formData.value.mobilenumber,
	   street1: this.formData.value.street1,
	   street2: this.formData.value.street2,
	   district: this.formData.value.district,
	   state: this.formData.value.state,
	   pincode: this.formData.value.pincode,
	   "createddate" : Date(),
	   "createdby":this.authService.getUserID(),
	   "modifieddate" : Date(),
	   "modifiedby":this.authService.getUserID(),
	 })
	 .then(
	   res => 
	   {
		   this.spinnerShow = false;
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
			}, err => {
			  console.log('err', err);
			})
		   this.presentAlert('Success','Congrats, User successfully created.');
	   },
	   err => {
		   this.spinnerShow = false;
		   this.presentAlert('Error',err);
	   }
	 )
  }
	
}
