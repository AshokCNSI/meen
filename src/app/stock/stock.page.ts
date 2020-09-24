import { Component, OnInit, ViewChild  } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { ActivatedRoute, NavigationEnd, NavigationStart  } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { filter } from 'rxjs/operators';
import { RouterserviceService } from '../routerservice.service';
import { AuthenticateService } from '../authentication.service';
import { LocationserviceService } from '../locationservice.service';
import { ModalController, NavParams } from '@ionic/angular';
import { MyaddressPage } from '../myaddress/myaddress.page';

import { StockdetailPage } from '../stockdetail/stockdetail.page';

import { Location } from '@angular/common';
import { LoadingService } from '../loading.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit {
  public stockList = [];
  constructor(
  public alertCtrl: AlertController,
  private navController: NavController, 
  private router: Router,
  private db: AngularFireDatabase,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService,
  private locationService: LocationserviceService,
  public modalController: ModalController,
  public location : Location,
  public loading: LoadingService,
  private geolocation: Geolocation,
  private storage: Storage
  ) { }
@ViewChild('search') search : any;
Arr = Array;
skeletoncount : number = 10;
categoryID : number;
fullStocks : AngularFireList<any>;
fullStocksCategory : AngularFireList<any>;
userEmail : string;
isAdmin : boolean = false;
searchInput : string;
searchVal : string;
productTempList = [];
productstatus : string;
productcode : string;
cartcount : number;
cartList = [];
  ngOnInit() {
	  if(this.authService.getIsUserLoggedIn()) {
		  this.storage.get('cart').then((val) => {
			if(val) {
				this.cartList = val;
			}
		  })
		}
	  this.activatedRoute.queryParams.subscribe(params => {
		  this.productcode = params['productcode'];
		  this.productstatus = params['productstatus'];
		  this.categoryID = this.activatedRoute.snapshot.params['id'];  
		  if(this.productcode != undefined) {
			  firebase.database().ref('/productsforselling/').orderByChild('productcode').equalTo(this.productcode).once('value').then((snapshot) => {
				  this.stockList = [];
				  this.productTempList = [];
					snapshot.forEach(item => {
						let b = item.toJSON();
						let index = item.key;
						if((this.productstatus == 'D') ? b['discount'] : b['available'] == 'Y') {
							firebase.database().ref('/properties/products/').orderByChild('productcode').equalTo(b['productcode']).once('value').then((snapshot) => {
								snapshot.forEach(item => {
									let a = item.toJSON();
									a['index'] = index;
									a['price'] = b['price'];
									a['discount'] = b['discount'];
									a['discountprice'] = b['discountprice'];
									a['selleruid'] = b['createdby'];
									firebase.database().ref('/profile/'+b['createdby']).once('value').then((snapshot) => {
										if(snapshot != null) {
											let distance = this.locationService.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),
															snapshot.child('latitude').val(),snapshot.child('longitude').val());
											a['distance'] = Math.round(distance * 100) / 100;
											a['shopname'] = snapshot.child('shopname').val();
											this.stockList.push(a);
											this.stockList.sort(function (a, b) {
												return Number(a.distance) - Number(b.distance);
											});
										}
									}).catch((error: any) => {
										
									});
								});
							}).catch((error: any) => {
								
							});
						}
					})
					this.productTempList = this.stockList;
					
				}).catch((error: any) => {
					
				});
		  } else if(this.categoryID == 0) {
				firebase.database().ref('/productsforselling/').once('value').then((snapshot) => {
				  this.stockList = [];
				  this.productTempList = [];
					snapshot.forEach(item => {
						let b = item.toJSON();
						let index = item.key;
						if(b['available'] == 'Y') {
							firebase.database().ref('/properties/products/').orderByChild('productcode').equalTo(b['productcode']).once('value').then((snapshot) => {
								snapshot.forEach(item => {
									let a = item.toJSON();
									a['index'] = index;
									a['price'] = b['price'];
									a['discount'] = b['discount'];
									a['discountprice'] = b['discountprice'];
									a['selleruid'] = b['createdby'];
									firebase.database().ref('/profile/'+b['createdby']).once('value').then((snapshot) => {
										if(snapshot != null) {
											let distance = this.locationService.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),
															snapshot.child('latitude').val(),snapshot.child('longitude').val());
											a['distance'] = Math.round(distance * 100) / 100;
											a['shopname'] = snapshot.child('shopname').val();
											this.stockList.push(a);
											this.stockList.sort(function (a, b) {
												return Number(a.distance) - Number(b.distance);
											});
										}
									}).catch((error: any) => {
										
									});
								});
							}).catch((error: any) => {
								
							});
						}
					})
					this.productTempList = this.stockList;
					
				}).catch((error: any) => {
					
				});
			  } else {
				  firebase.database().ref('/productsforselling/').orderByChild('category').equalTo(this.categoryID).once('value').then((snapshot) => {
				  this.stockList = [];
				  this.productTempList = [];
					snapshot.forEach(item => {
						let b = item.toJSON();
						let index = item.key;
						if(b['available'] == 'Y') {
							firebase.database().ref('/properties/products/').orderByChild('productcode').equalTo(b['productcode']).once('value').then((snapshot) => {
								snapshot.forEach(item => {
									let a = item.toJSON();
									a['index'] = index;
									a['price'] = b['price'];
									a['discount'] = b['discount'];
									a['discountprice'] = b['discountprice'];
									a['selleruid'] = b['createdby'];
									firebase.database().ref('/profile/'+b['createdby']).once('value').then((snapshot) => {
										if(snapshot != null) {
											let distance = this.locationService.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),
															snapshot.child('latitude').val(),snapshot.child('longitude').val());
											a['distance'] = Math.round(distance * 100) / 100;
											a['shopname'] = snapshot.child('shopname').val();
											this.stockList.push(a);
											this.stockList.sort(function (a, b) {
												return Number(a.distance) - Number(b.distance);
											});
										}
									}).catch((error: any) => {
										
									});
								});
							}).catch((error: any) => {
								
							});
						}
					})
					this.productTempList = this.stockList;
					
				}).catch((error: any) => {
					
				});
			  }
		});	  
	  
	if(this.authService.getUserType() == 'SA' || this.authService.getUserType() == 'A') {
		this.isAdmin = true;
	}
	  
  }
  
  routeStockDetail(index,productcode){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : 'R'}});
  }
  
  filterList(event) {
	if(event.srcElement.value == null || event.srcElement.value == '') {
		this.stockList = this.productTempList;
	} else {
		this.stockList = this.productTempList;
		this.stockList = this.stockList.filter(function(val) {
			return val.title.toLowerCase().indexOf((event.srcElement.value).toLowerCase()) > -1;
		});
	}
  }
  
  onCancel(event) {
	this.navController.navigateRoot('/home');
  }
  
  openSearch() {
	  this.searchInput = " ";
  }
  
  routeProductDetail(index) {
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, status : 'R'}});
  }
  
   logRatingChange(rating){
        console.log("changed rating: ",rating);
        // do your stuff
    }
	
  async openItemDetails(index) {
	const modal = await this.modalController.create({
	  component: StockdetailPage,
	  cssClass: 'stock-detail-modal-css',
	  componentProps: {
		itemid : index,
		options : "",
		desc : "",
		pagemode : 'D'
	  }
	});
	await modal.present();
  }

}
