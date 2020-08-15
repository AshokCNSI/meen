import { Component, OnInit, Injectable } from '@angular/core';
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
import { ModalController  } from '@ionic/angular';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-addressbook',
  templateUrl: './addressbook.page.html',
  styleUrls: ['./addressbook.page.scss'],
})
export class AddressbookPage implements OnInit {

  constructor(
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
  public modalController: ModalController) { 
  
  }
  
  addressList = [];
  name : string;
  mobile : string;
  houseno : string;
  streetname : string;
  landmark : string;
  latitude : string;
  longitude : string;
  address : string;
  customeraddress : string;
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
      buttons: ['Ok']
    });
    await alert.present();
  }
  
  ngOnInit() {
	  let options: NativeGeocoderOptions = {
			useLocale: true,
			maxResults: 5
		};
	  this.geolocation.getCurrentPosition().then((resp) => {
			this.latitude = (resp.coords.latitude).toString();
			this.longitude = (resp.coords.longitude).toString();
			this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
			.then((result: NativeGeocoderResult[]) => {
				this.address = this.generateAddress(result[0]);
			})
			.catch((error: any) => {
				this.latitude = "";
				this.longitude = "";
				this.address = 'No address found.';
			});
		}).catch((error) => {
			this.latitude = "";
			this.longitude = "";
		  this.address = 'No address found.'
		});
	  firebase.database().ref('/profile/'+this.authService.getUserID()).once('value').then((snapshot) => {
		  if(snapshot != null) {
			  this.customeraddress = snapshot.child('deliveryaddress').val();
		  }
	  });
	  
	  firebase.database().ref('/addressbook/').orderByChild('createdby').equalTo(this.authService.getUserID()).once('value').then((snapshot) => {
		this.addressList = [];
		if(snapshot != null) {
			snapshot.forEach(item => {
				let a = item.toJSON();
				a['index'] = item.key;
				this.addressList.push(a);
			});
		}
	});
  }
  
  addAddress() {
	  //this.latitude = "11.3172443";
	  //this.longitude = "77.7355966";
	  //this.address = "Erode";
	  if(!this.name || !this.mobile || !this.houseno || !this.streetname || !this.landmark || !this.latitude || !this.longitude || this.mobile.length != 10) {
		  if(!this.latitude || !this.longitude) {
			  this.presentAlert('Error','Please choose the location.');
		  } else if(!this.mobile) {
			  this.presentAlert('Error','Please give Contact Number.');
		  } else if(this.mobile.length != 10) {
			  this.presentAlert('Error','Contact Number is invalid.');
		  } else {
			  this.presentAlert('Error','Please fill all the required fields.');
		  }
	  } else {
		  firebase.database().ref('/addressbook/').push({
				"name" : this.name,
				"mobile" : this.mobile,
				"houseno" : this.houseno,
				"streetname" : this.streetname,
				"landmark" : this.landmark,
				"latitude" : this.latitude,
				"longitude" : this.longitude,
				"address" : this.address,
				"createddate" : Date(),
				"createdby":this.authService.getUserID(),
				"modifieddate": Date(),
				"modifiedby":this.authService.getUserID()
		  }).then(
		   res => 
		   {
			   this.presentAlert('Success','Your address has been successfully added');
			   this.name = '';
			   this.mobile = '';
			   this.houseno = '';
			   this.streetname = '';
			   this.landmark = '';
			   this.latitude = '';
			   this.longitude = '';
			   this.address = '';
			   firebase.database().ref('/addressbook/').orderByChild('createdby').equalTo(this.authService.getUserID()).once('value').then((snapshot) => {
				this.addressList = [];
				if(snapshot != null) {
					snapshot.forEach(item => {
						let a = item.toJSON();
						a['index'] = item.key;
						this.addressList.push(a);
					});
				}
			});
		   }
		 ).catch(res => console.log(res))
	  }
  }
  
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
						this.latitude = result[0].latitude;
						this.longitude = result[0].longitude;
						this.address = this.generateAddress(result[0]);
					})
					.catch((error: any) => {
						this.latitude = "";
						this.longitude = "";
						this.address = 'No address found.';
					});
				} else {
					this.latitude = "";
					this.longitude = "";
					this.address = 'No address found. Please enable location service and click update my location.';
				}
			}).catch(e => {
				this.latitude = "";
				this.longitude = "";
				this.address = 'No address found. Please enable location service and click update my location.'
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
				this.latitude = (resp.coords.latitude).toString();
				this.longitude = (resp.coords.longitude).toString();
				this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
				.then((result: NativeGeocoderResult[]) => {
					this.address = this.generateAddress(result[0]);
				})
				.catch((error: any) => {
					this.latitude = "";
					this.longitude = "";
					this.address = 'No address found. Please enable location service and click Home page to update the address to start using the app.';
					});
			}).catch((error) => {
				this.latitude = "";
				this.longitude = "";
			  this.address = 'No address found. Please enable location service and click Home page to update the address to start using the app.'
			});
		} else {
			this.latitude = "";
			this.longitude = "";
		  this.address = 'No address found. Please enable location service and click Home page to update the address to start using the app.';
		}
	  }).catch(e => {
			this.latitude = "";
			this.longitude = "";
		  this.address = 'No address found. Please enable location service and click Home page to update the address to start using the app.';
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
	
  selectAddress(addressindex):void {
		  firebase.database().ref('/profile/'+this.authService.getUserID()).update({
			   "deliveryaddress" : addressindex.index,
			   "modifieddate": Date(),
			   "modifiedby":this.authService.getUserID()
		  }).then(
		   res => 
		   {
			   this.presentAlert('Success','Your default address has been updated.');
			   this.navController.navigateRoot('/home');
		   }
		 ).catch(error => {
			this.presentAlert('Error',error);
		  });	
	  }
}
