import { Component, OnInit, Injectable, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart  } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterserviceService } from '../routerservice.service';
import { AuthenticateService } from '../authentication.service';
import { LocationserviceService } from '../locationservice.service';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

@Component({
  selector: 'app-locationpopover',
  templateUrl: './locationpopover.component.html',
  styleUrls: ['./locationpopover.component.scss'],
})
export class LocationpopoverComponent implements OnInit {

  constructor(
  public alertCtrl: AlertController, 
  private navController: NavController, 
  private router: Router,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService,
  private geolocation: Geolocation,
  private nativeGeocoder: NativeGeocoder,
  private locationService: LocationserviceService) { }
	
  current_location : string = "";
  current_lat : string = "";
  current_long : string = "";
  
  ngOnInit() {
	  
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
				.catch((error: any) => this.current_location = 'No address found.');
			}).catch((error) => {
			  this.current_location = 'No address found.'
			});
	  } else {
		  this.current_location = this.locationService.getCurrentLocation();
	  }
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
