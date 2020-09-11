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
import { LoadingService } from '../loading.service';
import { MapselectionPage } from '../mapselection/mapselection.page';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-addaddress',
  templateUrl: './addaddress.page.html',
  styleUrls: ['./addaddress.page.scss'],
})
export class AddaddressPage implements OnInit {

  constructor(
  public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  private navController: NavController, 
  public formBuilder: FormBuilder, 
  private router: Router,
  private db: AngularFireDatabase,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService,
  public loading: LoadingService,
  private modalController : ModalController
) { 
  
  }
  
  latitude : string;
  longitude : string;
  location : string;
  name : string;
  mobile : string;
  houseno : string;
  streetname : string;
  landmark : string;
  isSubmitted : boolean = false;
  
  ngOnInit() {
	  
  }
  
  addressData = this.formBuilder.group({
	   name: ['', [Validators.required]],
	   mobile: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')])],
	   houseno: ['', [Validators.required]],
	   streetname : ['', [Validators.required]],
	   landmark: ['', [Validators.required]],
	   location: ['', [Validators.required]]
	});
	
  get errorAddressControl() {
	return this.addressData.controls;
  }
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : false,
      buttons: [{
          text: 'Ok',
          handler: () => {
            
	  }}]
    });
    await alert.present();
  }
  
  async openMapSelection() {
    const modal = await this.modalController.create({
      component: MapselectionPage,
      cssClass: 'my-custom-class',
	  componentProps: {
		pagemode: 'AA'
	  }
    });
	modal.onDidDismiss()
      .then((data) => {
		  if (data !== null) {
			this.latitude = data.data.latitude;
			this.longitude = data.data.longitude;
			this.location = data.data.cur_location;
		  }
    });
    return await modal.present();
  }
  
  confirmMyLocation() {
	  this.isSubmitted = true;
	  if (!this.addressData.valid) {
		return false;
	  } else {
		  firebase.database().ref('/addressbook/').push({
				"name" : this.name,
				"mobile" : this.mobile,
				"houseno" : this.houseno,
				"streetname" : this.streetname,
				"landmark" : this.landmark,
				"latitude" : this.latitude,
				"longitude" : this.longitude,
				"address" : this.location,
				"createddate" : Date(),
				"createdby":this.authService.getUserID(),
				"modifieddate": Date(),
				"modifiedby":this.authService.getUserID()
		  }).then(
		   res => 
		   {
			   this.presentAlert('Success','Your address has been successfully added');
			   this.navController.navigateRoot('/addressbook');
		   }
		 ).catch(res => console.log(res))
	  }
  }

}