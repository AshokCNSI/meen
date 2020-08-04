import { Component, OnInit, ViewChild  } from '@angular/core';
import * as firebase from 'firebase';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticateService } from '../authentication.service';
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
  
  constructor(
  private activatedRoute: ActivatedRoute, 
  public fAuth: AngularFireAuth, 
  private authService: AuthenticateService,
  private db: AngularFireDatabase,
  private navController: NavController,
  private menuCtrl : MenuController,
  private geolocation: Geolocation,
  private nativeGeocoder: NativeGeocoder,
  private diagnostic: Diagnostic
  ) { 
		
  }

  ngOnInit() {
	  let options: NativeGeocoderOptions = {
		useLocale: true,
		maxResults: 5
	};
	  this.menuCtrl.enable(true);
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
		  }
		  this.isUserLoggedIn = this.authService.getIsUserLoggedIn();
		  
		}, err => {
		  console.log('err', err);
		});
		
	  this.spinnerShow = true;
	  let discountStocks = this.db.list('/stock', ref => ref.orderByChild('discount').equalTo("Y"));
	  discountStocks.snapshotChanges().subscribe(res => {
      this.discountList = [];
      res.forEach(item => {
        let a = item.payload.toJSON();
        a['$key'] = item.key;
		this.discountList.push(a);
      })
	  this.spinnerShow = false;
    });
	
	this.diagnostic.isLocationEnabled()
	  .then((state) => {
		if (state){
		  this.geolocation.getCurrentPosition().then((resp) => {
				console.log(resp.coords.latitude);
				console.log(resp.coords.longitude);
				this.current_location = resp.coords.longitude+ "--"+ resp.coords.longitude;
				this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
				.then((result: NativeGeocoderResult[]) => this.current_location = this.current_location + this.generateAddress(result[0]))
				.catch((error: any) => this.current_location = 'No address found. Please enable location service and click update my location.');
			}).catch((error) => {
			  this.current_location = 'No address found. Please enable location service and click update my location.'
			});
		} else {
		  this.current_location = 'No address found. Please enable location service and click update my location.';
		}
	  }).catch(e => this.current_location = 'No address found. Please enable location service and click update my location.');
  
	this.nativeGeocoder.forwardGeocode('Berlin', options)
	.then((result: NativeGeocoderResult[]) => console.log('The coordinates are latitude=' + result[0].latitude + ' and longitude=' + result[0].longitude))
	.catch((error: any) => console.log(error));
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
  
  updateMyLocation() {
	 let options: NativeGeocoderOptions = {
		useLocale: true,
		maxResults: 5
	};
	this.diagnostic.isLocationEnabled()
	  .then((state) => {
		if (state){
		  this.geolocation.getCurrentPosition().then((resp) => {
				console.log(resp.coords.latitude);
				console.log(resp.coords.longitude);
				this.current_location = resp.coords.longitude+ "--"+ resp.coords.longitude;
				this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
				.then((result: NativeGeocoderResult[]) => this.current_location = this.current_location + this.generateAddress(result[0]))
				.catch((error: any) => this.current_location = 'No address found. Please enable location service and click update my location.');
			}).catch((error) => {
			  this.current_location = 'No address found. Please enable location service and click update my location.'
			});
		} else {
		  this.current_location = 'No address found. Please enable location service and click update my location.';
		}
	  }).catch(e => this.current_location = 'No address found. Please enable location service and click update my location.');
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
