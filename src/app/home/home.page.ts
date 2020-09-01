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
import { NoticePage } from '../notice/notice.page';

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
      state('shown', style({ display: 'block' })),
      state('hidden', style({ display: 'none' })),
      transition('* => *', animate('150ms ease-in'))
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
  productvisibility: string = 'hidden';
  fishcategortList = [];
  instBanner = [];
  sliderOne: any;
  sliderTwo: any;
  sliderThree: any;
  
  //Configuration for each Slider
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 3,
    autoplay: false,
	spaceBetween: 10 
  };
  
  slideOptsTwo = {
    initialSlide: 0,
    slidesPerView: 1.1,
    autoplay: false,
	spaceBetween: 5 
  };
  
  slideOptsThree = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: false,
	spaceBetween: 5 
  };
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
  
  async presentNoticePopover(title, message) {
    const popover = await this.popoverController.create({
      component: NoticePage,
      cssClass: 'my-custom-class',
	  componentProps:{title: title, desc: message},
	  backdropDismiss: false
    });
    return await popover.present();
  }
  ngOnInit() { 
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
					this.loading.present();
					this.locationService.setCurrentLocationFn();
					this.loadData();
					this.loading.dismiss();
				}
			})
		} else {
			this.authService.setIsUserLoggedIn(false);
			this.loading.present();
			this.locationService.setCurrentLocationFn();
			this.loadData();
			this.loading.dismiss();
		}
	  }, err => {
		  console.log('err', err);
	 })
	 
	firebase.database().ref('/properties/prop').once('value').then((snapshot) => {
		  if(snapshot != null) {
			  if(snapshot.child('restrictapp').val() == 'Y') {
				this.presentNoticePopover(snapshot.child('restrictapptitle').val(),snapshot.child('restrictappmsg').val());
			  } else if(snapshot.child('updaterequired').val() == 'Y') {
				  this.presentNoticePopover(snapshot.child('updaterequiredtitle').val(),snapshot.child('updaterequiredmsg').val());
			  }
		  }
	  }).catch((error: any) => {
			this.loading.dismiss();
	  });
	firebase.database().ref('/properties/fishcategory').once('value').then((snapshot) => {
		  this.loading.present();
		  this.fishcategortList = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			this.fishcategortList.push(a);
		  })
		  this.loading.dismiss();
	  }).catch((error: any) => {
			this.loading.dismiss();
		});
		
	firebase.database().ref('/properties/instbanner').once('value').then((snapshot) => {
		  this.loading.present();
		  this.instBanner = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			this.instBanner.push(a);
		  })
		  this.loading.dismiss();
	  }).catch((error: any) => {
			this.loading.dismiss();
		});
}
  
  ionViewWillEnter() {
	this.menuCtrl.enable(true);
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
	if(event.srcElement.value == null || event.srcElement.value == '') {
		this.productList = this.productTempList;
		this.visibility = 'shown';
		this.productvisibility = 'hidden';
	} else {
		this.productList = this.productTempList;
		this.visibility = 'hidden';
		this.productvisibility = 'shown';
		this.productList = this.productList.filter(function(val) {
			return val.title.toLowerCase().indexOf((event.srcElement.value).toLowerCase()) > -1;
		});
	}
  }
	
	loadData() {
		this.menuCtrl.enable(true);
		  if(this.authService.getUserType() == 'D') {
			  firebase.database().ref('/orders/').once('value').then((snapshot) => { 
				  if(snapshot != null) {
					  this.productList = [];
					  snapshot.forEach(item => {
						let a = item.toJSON();
						a['index'] = item.key;
						 firebase.database().ref('/productsforselling/'+a['orderedto']).once('value').then((snapshot) => {
							if(snapshot != null) {
								a['price'] = snapshot.child('price').val();
								a['productcode'] = snapshot.child('productcode').val();
								a['seller'] = snapshot.child('createdby').val();
								 firebase.database().ref('/profile/'+a['seller']).once('value').then((snapshot) => {
									if(snapshot != null) {
										let distance = this.locationService.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),snapshot.child('latitude').val(),snapshot.child('longitude').val());
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
										}).catch((error: any) => {
											
										});
									}
								}).catch((error: any) => {
									
								});
							}
						}).catch((error: any) => {
								
							});
						this.productTempList = this.productList;
					  })
				  }
			}).catch((error: any) => {
				
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
					}).catch((error: any) => {
						
					});
					this.productTempList = this.productList;
				  })
			  }).catch((error: any) => {
					
				});
			} else {
					firebase.database().ref('/properties/products/').once('value').then((snapshot) => {
						
						this.productList = [];
						this.productTempList = [];
						snapshot.forEach(item => {
							let a = item.toJSON();
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
							}).catch((error: any) => {
								
							});
							this.productTempList = this.productList;
						});
					}).catch((error: any) => {
						
					});
					
					firebase.database().ref('/properties/products/').once('value').then((snapshot) => {
						this.discountList = [];
						snapshot.forEach(item => {
							let a = item.toJSON();
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
							}).catch((error: any) => {
								
							});
						});
					}).catch((error: any) => {
						
					});
				}  
			
	}
	
	hideContent() {
		this.visibility = 'hidden';
		this.productvisibility = 'shown';
	}
	
	onCancel(event) {
		this.visibility = 'shown';
		this.productvisibility = 'hidden';
	}
}
