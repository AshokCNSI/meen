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
import { MapselectionPage } from '../mapselection/mapselection.page';
import { Storage } from '@ionic/storage';

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
  Arr = Array;
  skeletoncount : number = 10;
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
  notificationcount : number;
  cartcount : number;
  sellerList = [];
  cartList = [];
  nodiscountstatus = false;
  nosellerrecordstatus = false;
  //Configuration for each Slider
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 2,
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
    slidesPerView: 1.1,
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
  private locationService: LocationserviceService,
  private storage: Storage
  ) { 
		
  }
	
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : false,
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
	
	this.loadData();
	firebase.database().ref('/properties/prop').once('value').then((snapshot) => {
		  if(snapshot != null) {
			  if(snapshot.child('restrictapp').val() == 'Y') {
				this.presentNoticePopover(snapshot.child('restrictapptitle').val(),snapshot.child('restrictappmsg').val());
			  } else if(snapshot.child('updaterequired').val() == 'Y') {
				  this.presentNoticePopover(snapshot.child('updaterequiredtitle').val(),snapshot.child('updaterequiredmsg').val());
			  }
		  }
	  }).catch((error: any) => {
	  });
	firebase.database().ref('/properties/fishcategory').once('value').then((snapshot) => {
		  this.fishcategortList = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			this.fishcategortList.push(a);
		  })
	  }).catch((error: any) => {
		});
		
	firebase.database().ref('/properties/instbanner').once('value').then((snapshot) => {
		  this.instBanner = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			this.instBanner.push(a);
		  })
	  }).catch((error: any) => {
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

					this.storage.get('cart').then((val) => {
						if(val) {
							this.cartList = val;
						}
					})
					
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
					
					this.fetchSeller();
					this.fetchDiscount();
					
				
	}
	
	hideContent() {
		this.visibility = 'hidden';
		this.productvisibility = 'shown';
	}
	
	onCancel(event) {
		this.visibility = 'shown';
		this.productvisibility = 'hidden';
	}
	
	async openMapSelection() {
		const modal = await this.modalController.create({
		  component: MapselectionPage,
		  cssClass: 'my-custom-class',
		  componentProps: {
			pagemode: 'H'
		  }
		});
		modal.onDidDismiss()
		  .then((data) => {
			this.fetchSeller();
			this.fetchDiscount();
			this.menuCtrl.enable(true);
		});
		return await modal.present();
  }
  
  fetchSeller() {
	  this.nosellerrecordstatus = false;
	  firebase.database().ref('/profile/').orderByChild('usertype').equalTo('S').once('value').then((snapshot) => {
		this.sellerList = [];
		if(snapshot != null) {
			snapshot.forEach(item => {
				let a = item.toJSON();
				console.log(a);
				let distance = this.locationService.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),
								a['latitude'],a['longitude']);
				a['distance'] = Math.floor(Math.round(distance * 100) / 100);
				if(a['distance'] <= 10) {
					a['estimatedtimearr'] = Math.floor(Math.round(((distance / 40) * 60) *100)/100);
					let starttimes = a['starttime'].split(":");
					let endtimes = a['endtime'].split(":");
					let starttime = Number(starttimes[0]) * 60 + Number(starttimes[1]);
					let endtime = Number(endtimes[0]) * 60 + Number(endtimes[1]);
					
					let currentdate = new Date(); 
					let currenttime = Number(currentdate.getHours()) * 60 + Number(currentdate.getMinutes());
					a['shopavailable'] = (starttime <= currenttime && currenttime <= endtime) ? 'Y' : 'N';
					this.sellerList.push(a);
					this.sellerList.sort(function (a, b) {
						return Number(a.distance) - Number(b.distance);
					});
				}
			})
		}
	}).catch((error: any) => {
		
	});
	setTimeout(() => {
		if(this.sellerList.length == 0) {
			this.nosellerrecordstatus = true;
		}
	}, 10000);
  }
  
  fetchDiscount() {
	  this.nodiscountstatus = false;
	  firebase.database().ref('/properties/products/').once('value').then((snapshot) => {
		this.discountList = [];
		this.notificationcount = 0;
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
					this.notificationcount = this.notificationcount + 1;
					
				}
			}).catch((error: any) => {
				
			});
		});
	}).catch((error: any) => {
		
	});
	setTimeout(() => {
		if(this.discountList.length == 0) {
			this.nodiscountstatus = true;
		}
	}, 10000);
  }
 
}
