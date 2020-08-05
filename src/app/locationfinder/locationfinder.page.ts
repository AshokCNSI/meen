import { Component, OnInit, Injectable, Input } from '@angular/core';
import {  MenuController } from '@ionic/angular';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, NavigationEnd, NavigationStart  } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { filter } from 'rxjs/operators';
import { RouterserviceService } from '../routerservice.service';
import { AuthenticateService } from '../authentication.service';
import { LocationserviceService } from '../locationservice.service';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Component({
  selector: 'app-locationfinder',
  templateUrl: './locationfinder.page.html',
  styleUrls: ['./locationfinder.page.scss'],
})
export class LocationfinderPage implements OnInit {

  constructor(
  private menuCtrl : MenuController,
  public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  private navController: NavController, 
  private router: Router,
  private db: AngularFireDatabase,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService,
  private geolocation: Geolocation,
  private nativeGeocoder: NativeGeocoder,
  private diagnostic: Diagnostic,
  private locationService: LocationserviceService) { }

  ngOnInit() {
	  this.menuCtrl.enable(false);
	  this.diagnostic.isLocationEnabled()
	  .then((state) => {
		if (!state){
		  this.current_location = 'No address found.';
		}
	  }).catch(e => this.current_location = 'No address found.');
  }
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
      buttons: ['Ok']
    });
    await alert.present();
  }
  
  current_location : string = "";
  current_lat : string = "";
  current_long : string = "";
  
  filtermap(event) {
		let options: NativeGeocoderOptions = {
			useLocale: true,
			maxResults: 5
		};
		if(event.srcElement.value != null && event.srcElement.value != '') {
			this.diagnostic.isLocationEnabled()
			  .then((state) => {
				if (state){
					this.nativeGeocoder.forwardGeocode(event.srcElement.value, options)
					.then((result: NativeGeocoderResult[]) => {
						this.locationService.setLatitude(result[0].latitude);
						this.locationService.setLongitude(result[0].longitude);
						this.locationService.setCurrentLocation(this.generateAddress(result[0]));
						this.current_location = this.generateAddress(result[0]);
					})
					.catch((error: any) => console.log(error));
				} else {
					this.current_location = 'No address found. Please enable location service and click update my location.';
				}
			}).catch(e => this.current_location = 'No address found. Please enable location service and click update my location.');
			}
	}
  
  locateMe() {
	 let options: NativeGeocoderOptions = {
		useLocale: true,
		maxResults: 5
	};
	this.diagnostic.isLocationEnabled()
	  .then((state) => {
		if (state){
		  this.geolocation.getCurrentPosition().then((resp) => {
				this.locationService.setLatitude((resp.coords.latitude).toString());
				this.locationService.setLongitude((resp.coords.longitude).toString());
				this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
				.then((result: NativeGeocoderResult[]) => {
					this.current_location = this.generateAddress(result[0]);
					this.locationService.setCurrentLocation(this.current_location);
				})
				.catch((error: any) => this.current_location = 'No address found. Please enable location service and click Home page to update the address to start using the app.');
			}).catch((error) => {
			  this.current_location = 'No address found. Please enable location service and click Home page to update the address to start using the app.'
			});
		} else {
		  this.current_location = 'No address found. Please enable location service and click Home page to update the address to start using the app.';
		}
	  }).catch(e => this.current_location = 'No address found. Please enable location service and click Home page to update the address to start using the app.');
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
  
  updateMyLocation() {
	if(this.locationService.getLatitude() != undefined && this.locationService.getLatitude() != "" 
		&& this.locationService.getLongitude() != undefined && this.locationService.getLongitude() != ""
		&& this.locationService.getCurrentLocation() != undefined && this.locationService.getCurrentLocation() != "") {
		this.navController.navigateRoot('/home');
	} else {
		this.presentAlert('Error','No address found');
	}
  }
}
