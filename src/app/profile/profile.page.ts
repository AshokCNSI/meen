import { Component, OnInit, Injectable, Input } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, NavigationEnd, NavigationStart  } from '@angular/router';
import{ Validators, FormBuilder, FormGroup, FormControl }from'@angular/forms';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { filter } from 'rxjs/operators';
import { RouterserviceService } from '../routerservice.service';
import { AuthenticateService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(
  public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  public formBuilder: FormBuilder, 
  private navController: NavController, 
  private router: Router,
  private db: AngularFireDatabase,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService
) { 
  
  }
  
  isSubmitted = false;
  firstname: string; 
  lastname : string;
  mobilenumber : number;
  street1 : string;
  street2 : string;
  district : string;
  state : string;
  pincode : number;
  spinnerShow = false;
  usertype : string;
  rolename : string;
  locationList = [];
  stateList = [];
  shopname : string;
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : false,
      buttons: ['Ok']
    });
    await alert.present();
  }
  
  ngOnInit() {
		firebase.database().ref('/profile/'+this.authService.getUserID()).once('value').then((snapshot) => {
			  this.firstname = snapshot.child('firstname').val();
			  this.lastname = snapshot.child('lastname').val();
			  this.mobilenumber = snapshot.child('mobilenumber').val();
			  this.street1 = snapshot.child('street1').val();
			  this.street2 = snapshot.child('street2').val();
			  this.district = snapshot.child('district').val();
			  this.state = snapshot.child('state').val();
			  this.pincode = snapshot.child('pincode').val();
			  this.usertype = snapshot.child('usertype').val();
			  this.shopname = snapshot.child('shopname').val();
			  if(this.usertype == 'A') {
				  this.rolename = 'Administrator';
			  } else if(this.usertype == 'SA') {
				  this.rolename = 'Super Administrator';
			  } else if(this.usertype == 'C') {
				  this.rolename = 'Client';
			  } else if(this.usertype == 'S') {
				  this.rolename = 'Seller';
			  }
		  });
	firebase.database().ref('/properties/States').orderByChild('state_name').once('value').then((snapshot) => {
		  this.stateList = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			this.stateList.push(a);
		  })

	  });
	firebase.database().ref('/properties/location/'+this.state).once('value').then((snapshot) => {
		  this.locationList = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			if(a['available'] == true) {
				this.locationList.push(a);
			}
		  })

	  });
  }
  
  profileData = this.formBuilder.group({
	   firstname: ['', [Validators.required]],
	   lastname: ['', [Validators.required]],
	   mobilenumber: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')])],
	   shopname : ['', this.usertype == 'S' ? [Validators.required] : []],
	   street1: ['', [Validators.required]],
	   street2: ['', []],
	   district: ['', [Validators.required]],
	   state: ['', [Validators.required]],
	   pincode: ['', [Validators.required, ,Validators.pattern('^[0-9]+$')]]
	});
	
	get errorControl() {
		return this.profileData.controls;
	}
	
	addProfile() {
	  this.isSubmitted = true;
	  if (!this.profileData.valid) {
		return false;
	  } else {
		this.spinnerShow = true;
		firebase.database().ref('/profile/'+this.authService.getUserID()).update({
			   firstname: this.profileData.value.firstname,
			   lastname: this.profileData.value.lastname,
			   mobilenumber: this.profileData.value.mobilenumber,
			   shopname: this.profileData.value.shopname,
			   street1: this.profileData.value.street1,
			   street2: this.profileData.value.street2,
			   district: this.profileData.value.district,
			   state: this.profileData.value.state,
			   pincode: this.profileData.value.pincode,
			   usertype: this.authService.getUserType(),
			   "modifieddate": Date(),
			   "modifiedby":this.authService.getUserID()
		  }).then(
		   res => 
		   {
			   this.spinnerShow = false;
			   this.authService.setUserName(this.profileData.value.firstname+" "+this.profileData.value.lastname);
			   this.navController.navigateRoot('/home');
		   }
		 ).catch(error => {
			this.presentAlert('Error',error);
		  });		  
	  }
  }
  
  selectState($event) {
	  this.state = $event.target.value;
	  firebase.database().ref('/properties/location/'+this.state).once('value').then((snapshot) => {
		  this.locationList = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			if(a['available'] == true) {
				this.locationList.push(a);
			}
		  })
	  });
  }
  
}
