import { Component, OnInit, Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import{ Validators, FormBuilder, FormGroup, FormControl }from'@angular/forms';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

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
  public formBuilder: FormBuilder, 
  private navController: NavController, 
  private router: Router) { }

  ngOnInit() {
	
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
	});
	
	get errorControl() {
		return this.formData.controls;
	  }
  
  register(form) {
	  this.isSubmitted = true;
	  if (!this.formData.valid) {
		return false;
	  } else {
		firebase.auth().createUserWithEmailAndPassword(this.formData.value.email, this.formData.value.password)
		.then((result) => {
			this.presentAlert('Success','Congrats, User successfully created.');
		}).catch((error) => {
			this.presentAlert('Error',error.message);
		});
	  }
  }
	
}
