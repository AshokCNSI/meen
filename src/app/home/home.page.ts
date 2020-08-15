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
import { map } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { IonSlides } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  animations: [
    trigger('visibilityChanged', [
      state('shown', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('* => *', animate('500ms'))
    ])
  ]
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
  productList = [];
  productTempList = [];
  userList = [];
  priceList = [];
  discountPriceList = [];
  visibility: string = 'shown';
  fishcategortList = [];
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
		  //this.loading.present();
		  if(this.authService.getUserType() == 'D') {
			  this.db.list('/orders').snapshotChanges().subscribe(res => { 
				  if(res != null) {
					  this.productList = [];
					  res.forEach(item => {
						let a = item.payload.toJSON();
						a['index'] = item.key;
						firebase.database().ref('/productsforselling/'+a['orderedto']).once('value').then((snapshot) => {
							if(snapshot != null) {
								a['price'] = snapshot.child('price').val();
								a['productcode'] = snapshot.child('productcode').val();
								a['seller'] = snapshot.child('createdby').val();
								firebase.database().ref('/profile/'+a['seller']).once('value').then((snapshot) => {
									if(snapshot != null) {
										let distance = this.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),snapshot.child('latitude').val(),snapshot.child('longitude').val());
										a['distance'] = Math.round(distance * 100) / 100;
										firebase.database().ref('/properties/products/'+a['productcode']).once('value').then((snapshot) => {
											if(snapshot != null) {
												a['title'] = snapshot.child('title').val();
												a['details'] = snapshot.child('details').val();
												a['imagepath'] = snapshot.child('imagepath').val();
												if(a['currentstatus'] == 'WFP') {
													this.productList.push(a);
												}
											}
										})
									}
								});
							}
						});
						this.productTempList = this.productList;
					  })
				  }
				  this.loading.dismiss();
			});
		} else if(this.authService.getUserType() == 'S') {
			  firebase.database().ref('/productsforselling/').orderByChild('createdby').equalTo(this.authService.getUserID()).once('value').then((snapshot) => {
				  this.productList = [];
				  this.productTempList = [];
				  snapshot.forEach(item => {
					let a = item.toJSON();
					a['index'] = item.key;
					firebase.database().ref('/properties/products/'+a['productcode']).once('value').then((snapshot) => {
						a['title'] = snapshot.child('title').val();
						a['imagepath'] = snapshot.child('imagepath').val();
						a['details'] = snapshot.child('details').val();
						if(a['available'] == 'Y') {
							this.productList.push(a);
						}
					})
					this.productTempList = this.productList;
				  })
				  this.loading.dismiss();
			  });
			} else {
					this.db.list('/properties/products/').snapshotChanges().subscribe(res => {
						this.productList = [];
						this.productTempList = [];
						res.forEach(item => {
							let a = item.payload.toJSON();
							firebase.database().ref('/productsforselling/').orderByChild('productcode').equalTo(a['productcode']).once('value').then((snapshot) => {
								this.priceList = [];
								snapshot.forEach(item => {
									let b = item.toJSON();
									if(b['available'] == 'Y') {
										this.priceList.push(b['price']);
									}
								})
								if(this.priceList.length > 0) {
									a['price'] = Math.min.apply(Math, this.priceList);
									this.productList.push(a);
								}
							})
							this.productTempList = this.productList;
						});
					})
					
					this.db.list('/properties/products/').snapshotChanges().subscribe(res => {
						this.discountList = [];
						res.forEach(item => {
							let a = item.payload.toJSON();
							firebase.database().ref('/productsforselling/').orderByChild('productcode').equalTo(a['productcode']).once('value').then((snapshot) => {
								this.discountPriceList = [];
								snapshot.forEach(item => {
									let b = item.toJSON();
									if(b['discount'] == 'Y' && b['discountprice'] > 0) {
										this.discountPriceList.push(b['discountprice']);
									}
								})
								if(this.discountPriceList.length > 0) {
									a['price'] = Math.max.apply(Math, this.discountPriceList);
									this.discountList.push(a);
								}
							})
						});
					})
				}  
			
	firebase.database().ref('/properties/fishcategory').once('value').then((snapshot) => {
		  this.fishcategortList = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			this.fishcategortList.push(a);
		  })

	  });
  }
  
  ionViewWillEnter() {
	this.menuCtrl.enable(true);
	this.locationService.setCurrentLocationFn();
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
  
  nagivateProdcut(status, productcode) {
	  this.navController.navigateRoot('/stock/0', {queryParams : {productcode : productcode, status : status}});
  }
  
  async presentPopover() {
    const popover = await this.popoverController.create({
      component: LocationpopoverComponent,
      cssClass: 'location-popover',
	  backdropDismiss: true
    });
    return await popover.present();
  }
  
  routeProductDetail(index) {
	  this.navController.navigateRoot('/addproduct',{queryParams : {index : index}});
  }
  
  routeStockDetail(index,productcode,status){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : status}});
  }
  
  filterProductList(event) {
	this.visibility = 'hidden';
	if(event.srcElement.value == null || event.srcElement.value == '') {
		this.productList = this.productTempList;
	} else {
		this.productList = this.productTempList;
		this.productList = this.productList.filter(function(val) {
			return val.title.toLowerCase().indexOf((event.srcElement.value).toLowerCase()) > -1;
		});
	}
  }
  
  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	  var R = 6371; // Radius of the earth in km
	  var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
	  var dLon = this.deg2rad(lon2-lon1); 
	  var a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
		Math.sin(dLon/2) * Math.sin(dLon/2)
		; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; // Distance in km
	  return d;
	}

	deg2rad(deg) {
	  return deg * (Math.PI/180)
	}
}
