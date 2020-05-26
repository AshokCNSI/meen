import { Component, OnInit, Injectable } from '@angular/core';
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

  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
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
		  });
  }
  
  profileData = this.formBuilder.group({
	   firstname: ['', [Validators.required]],
	   lastname: ['', [Validators.required]],
	   mobilenumber: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')])],
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
		return new Promise<any>((resolve, reject) => {
		 firebase.database().ref('/profile/'+this.authService.getUserID()).set({
			   firstname: this.profileData.value.firstname,
			   lastname: this.profileData.value.lastname,
			   mobilenumber: this.profileData.value.mobilenumber,
			   street1: this.profileData.value.street1,
			   street2: this.profileData.value.street2,
			   district: this.profileData.value.district,
			   state: this.profileData.value.state,
			   pincode: this.profileData.value.pincode
		 })
		 .then(
		   res => 
		   {
			   this.presentAlert('Success','Profile updated successfully.');
			   resolve(res);
		   },
		   err => reject(err)
		 )
	   })
	  }
  }
}