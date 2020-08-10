import { Component, OnInit, ViewChild  } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { LocationpopoverComponent } from '../locationpopover/locationpopover.component';

import * as firebase from 'firebase';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertController } from '@ionic/angular';

import { AuthenticateService } from '../authentication.service';
import { LocationserviceService } from '../locationservice.service';
import { LoadingService } from '../loading.service';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { NavController } from '@ionic/angular';
import {  MenuController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';


import { IonSlides } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
	
  public discountList = [];
  @ViewChild('mySlider') slider: IonSlides;
  userEmail : string;
  isUserLoggedIn : boolean = false;
  spinnerShow = false;
  isAdmin : boolean = false;
  current_location : string = "";
  current_lat : string = "";
  current_long : string = "";
  enableBackdropDismiss = false;
  showBackdrop = false;
  shouldPropagate = false;
  
  constructor(
  public alertCtrl: AlertController,
  public modalController: ModalController,
  public popoverController : PopoverController,
  public loading: LoadingService,
  private activatedRoute: ActivatedRoute, 
  public fAuth: AngularFireAuth, 
  private authService: AuthenticateService,
  private db: AngularFireDatabase,
  private navController: NavController,
  private menuCtrl : MenuController,
  private geolocation: Geolocation,
  private nativeGeocoder: NativeGeocoder,
  private diagnostic: Diagnostic,
  private locationService: LocationserviceService
  ) { 
		
  }
	
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
      buttons: ['Ok']
    });
    await alert.present();
  }
  ngOnInit() {
	  
	  this.menuCtrl.enable(true);
	  //this.presentPopover();
	  this.loading.present();
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
					if(this.authService.getUserType() == 'SA' || this.authService.getUserType() == 'A') {
					  this.isAdmin = true;
					}
				}
			});
		  } else {
			  this.authService.setIsUserLoggedIn(false);
			  this.setCurrentLocationFn();
		  }
		  this.isUserLoggedIn = this.authService.getIsUserLoggedIn();
		  
		}, err => {
		  console.log('err', err);
		});
		
	  let discountStocks = this.db.list('/stock', ref => ref.orderByChild('discount').equalTo("Y"));
	  discountStocks.snapshotChanges().subscribe(res => {
      this.discountList = [];
      res.forEach(item => {
        let a = item.payload.toJSON();
        a['$key'] = item.key;
		this.discountList.push(a);
      })
	  this.loading.dismiss();
    });
	
  }
  
  ionViewWillEnter() {
	this.loading.present();
	this.menuCtrl.enable(true);
	this.setCurrentLocationFn();
  }

	generateAddress(addressObj) {
		let obj = [];
		let address = "";
		for (let key in addressObj) {
		  obj.push(addressObj[key]);
		}
		obj.reverse();
		for (let val in obj) {
		  if (obj[val].length)
			address += obj[val] + ', ';
		}
		return address.slice(0, -2);
	  }
  onSlideChanged(e) {
    
  }

  onSlideChangeStart(event) {
    /** isEnd true when slides reach at end slide */
    event.target.isEnd().then(isEnd => {
      
    });
  }
  
  slidesDidLoad(slides: IonSlides) {
    slides.startAutoplay();
  }
  
  nagivateProdcut(index, productcode) {
	  this.navController.navigateRoot('/stockdetail', {queryParams : {index : index, productcode : productcode, status : 'R'}});
  }
  
  filterList(event) {
	  this.navController.navigateRoot('/stock/0', {queryParams : {search : 'Y', val : event.srcElement.value}});
  }
  
  async presentPopover() {
    const popover = await this.popoverController.create({
      component: LocationpopoverComponent,
      cssClass: 'location-popover',
	  backdropDismiss: true
    });
    return await popover.present();
  }
  
  setCurrentLocationFn() {
	  let options: NativeGeocoderOptions = {
		useLocale: true,
		maxResults: 5
	};
	this.authService.userDetails().subscribe(res => { 
		if (res !== null) {
			firebase.database().ref('/profile/'+res.uid).once('value').then((snapshot) => {
				if(snapshot != null) {
					if(snapshot.child('latitude').val() == null 
						|| snapshot.child('latitude').val() == undefined 
						|| snapshot.child('latitude').val() == "") {
						this.navController.navigateRoot('/locationmap');
					} else {
						this.locationService.setLatitude(snapshot.child('latitude').val());
						this.locationService.setLongitude(snapshot.child('longitude').val());
						this.locationService.setCurrentLocation(snapshot.child('lastlocation').val());
						this.current_location = snapshot.child('lastlocation').val();
					}
				}
			});
		  } else {
			  if(this.locationService.getLatitude() == undefined || this.locationService.getLatitude() == "" 
				|| this.locationService.getLongitude() == undefined || this.locationService.getLongitude() == ""
				|| this.locationService.getCurrentLocation() == undefined || this.locationService.getCurrentLocation() == "") {
				  this.geolocation.getCurrentPosition().then((resp) => {
						this.locationService.setLatitude((resp.coords.latitude).toString());
						this.locationService.setLongitude((resp.coords.longitude).toString());
						this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
						.then((result: NativeGeocoderResult[]) => {
							this.current_location = this.generateAddress(result[0]);
							this.locationService.setCurrentLocation(this.current_location);
						})
						.catch((error: any) => {
							this.locationService.setLatitude("");
							this.locationService.setLongitude("");
							this.locationService.setCurrentLocation("");
							this.current_location = 'No address found.';
						});
					}).catch((error: any) => {
						this.locationService.setLatitude("");
						this.locationService.setLongitude("");
						this.locationService.setCurrentLocation("");
						this.current_location = 'No address found.';
					});
			  } else {
				  this.current_location = this.locationService.getCurrentLocation();
			  }
		  }	
		  this.loading.dismiss();		  
		}, err => {
		  console.log('err', err);
		  this.loading.dismiss();	
		});
  }
}
