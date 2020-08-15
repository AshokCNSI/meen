import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { NavController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AuthenticateService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class LocationserviceService {

  constructor(public navController : NavController,
  private geolocation: Geolocation,
  private nativeGeocoder: NativeGeocoder,
  private diagnostic: Diagnostic,
  private authService: AuthenticateService) { }
  
  latitude : string;
  longitude : string;
  currentLocation : string;
  
  setLatitude(value : string) {
	  this.latitude = value;
  }
  
  getLatitude() {
	  return this.latitude;
  }
  
  setLongitude(value : string) {
	  this.longitude = value;
  }
  
  getLongitude() {
	  return this.longitude;
  }
  
  setCurrentLocation(value : string) {
	  this.currentLocation = value;
  }
  
  getCurrentLocation() {
	  return this.currentLocation;
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
						this.setLatitude(snapshot.child('latitude').val());
						this.setLongitude(snapshot.child('longitude').val());
						this.setCurrentLocation(snapshot.child('lastlocation').val());
					}
				}
			});
		  } else {
			  if(this.getLatitude() == undefined || this.getLatitude() == "" 
				|| this.getLongitude() == undefined || this.getLongitude() == ""
				|| this.getCurrentLocation() == undefined || this.getCurrentLocation() == "") {
				  this.geolocation.getCurrentPosition().then((resp) => {
						this.setLatitude((resp.coords.latitude).toString());
						this.setLongitude((resp.coords.longitude).toString());
						this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
						.then((result: NativeGeocoderResult[]) => {
							this.setCurrentLocation(this.generateAddress(result[0]));
						})
						.catch((error: any) => {
							this.setLatitude("");
							this.setLongitude("");
							this.setCurrentLocation("");
						});
					}).catch((error: any) => {
						this.setLatitude("");
						this.setLongitude("");
						this.setCurrentLocation("");
					});
			  } 
		  }	
		}, err => {
		  console.log('err', err);
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
}
