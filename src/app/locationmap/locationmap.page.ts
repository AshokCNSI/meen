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
  selector: 'app-locationmap',
  templateUrl: './locationmap.page.html',
  styleUrls: ['./locationmap.page.scss'],
})
export class LocationmapPage implements OnInit {

  constructor(
  public alertCtrl: AlertController, 
  public menuCtrl : MenuController,
  private navController: NavController, 
  private router: Router,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService,
  private geolocation: Geolocation,
  private nativeGeocoder: NativeGeocoder,
  private diagnostic: Diagnostic,
  private locationService: LocationserviceService) { }
	
  isHidden = false;
  ngOnInit() {
	
	this.authService.userDetails().subscribe(res => { 
	  if (res !== null) {
		firebase.database().ref('/profile/'+res.uid).once('value').then((snapshot) => {
			if(snapshot != null) {
				if(snapshot.child('latitude').val() == null 
					|| snapshot.child('latitude').val() == undefined 
					|| snapshot.child('latitude').val() == "") {
					this.isHidden = true;
					this.menuCtrl.enable(false);
				} 
			}
		});
	  } 
	}, err => {
	  console.log('err', err);
	});
	let options: NativeGeocoderOptions = {
		useLocale: true,
		maxResults: 5
	};
	  if(this.locationService.getLatitude() == undefined || this.locationService.getLatitude() == "" 
		|| this.locationService.getLongitude() == undefined || this.locationService.getLongitude() == ""
		|| this.locationService.getCurrentLocation() == undefined || this.locationService.getCurrentLocation() == "") {
		  this.geolocation.getCurrentPosition().then((resp) => {
				this.current_lat = (resp.coords.latitude).toString();
				this.current_long = (resp.coords.longitude).toString();
				this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
				.then((result: NativeGeocoderResult[]) => {
					this.current_location = this.generateAddress(result[0]);
				})
				.catch((error: any) => {
					this.current_lat = "";
					this.current_long = "";
					this.current_location = 'No address found.';
				});
			}).catch((error) => {
				this.current_lat = "";
				this.current_long = "";
			  this.current_location = 'No address found.'
			});
	  } else {
		  this.current_location = this.locationService.getCurrentLocation();
	  }
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
						this.current_lat = result[0].latitude;
						this.current_long = result[0].longitude;
						this.current_location = this.generateAddress(result[0]);
					})
					.catch((error: any) => {
						this.current_lat = "";
						this.current_long = "";
						this.current_location = 'No address found.';
					});
				} else {
					this.current_lat = "";
					this.current_long = "";
					this.current_location = 'No address found. Please enable location service and click update my location.';
				}
			}).catch(e => {
				this.current_lat = "";
				this.current_long = "";
				this.current_location = 'No address found. Please enable location service and click update my location.'
				});
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
				this.current_lat = (resp.coords.latitude).toString();
				this.current_long = (resp.coords.longitude).toString();
				this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
				.then((result: NativeGeocoderResult[]) => {
					this.current_location = this.generateAddress(result[0]);
				})
				.catch((error: any) => {
					this.current_lat = "";
					this.current_long = "";
					this.current_location = 'No address found. Please enable location service and click Home page to update the address to start using the app.';
					});
			}).catch((error) => {
				this.current_lat = "";
				this.current_long = "";
			  this.current_location = 'No address found. Please enable location service and click Home page to update the address to start using the app.'
			});
		} else {
			this.current_lat = "";
			this.current_long = "";
		  this.current_location = 'No address found. Please enable location service and click Home page to update the address to start using the app.';
		}
	  }).catch(e => {
			this.current_lat = "";
			this.current_long = "";
		  this.current_location = 'No address found. Please enable location service and click Home page to update the address to start using the app.';
	  });
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
	if(this.current_lat != undefined && this.current_lat != "" 
		&& this.current_long != undefined && this.current_long != ""
		&& this.current_location != undefined && this.current_location != "") {
			if(this.authService.getUserID() != null && this.authService.getUserID() != undefined && this.authService.getUserID() != "") {
				firebase.database().ref('/profile/'+this.authService.getUserID()).update({
				   "latitude" : this.current_lat,
				   "longitude" : this.current_long,
				   "lastlocation" : this.current_location,
				   "modifieddate": Date(),
				   "modifiedby":this.authService.getUserID()
			  }).then(
			   res => 
			   {
				    this.locationService.setLatitude(this.current_lat);
					this.locationService.setLongitude(this.current_long);
					this.locationService.setCurrentLocation(this.current_location);
					this.navController.navigateRoot('/home');
			   }
			 ).catch(error => {
				this.presentAlert('Error',error);
			  });	
		} else {
			this.locationService.setLatitude(this.current_lat);
			this.locationService.setLongitude(this.current_long);
			this.locationService.setCurrentLocation(this.current_location);
			this.navController.navigateRoot('/home');
		}
	} else {
		this.presentAlert('Error','No address found');
	}
  }

}
