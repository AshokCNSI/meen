import { Component, OnInit, ViewChild  } from '@angular/core';
import * as firebase from 'firebase';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticateService } from '../authentication.service';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { NavController } from '@ionic/angular';
import { LocationserviceService } from '../locationservice.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit {
  public stockList = [];
  constructor(
  private activatedRoute: ActivatedRoute, 
  public fAuth: AngularFireAuth, 
  private authService: AuthenticateService,
  private db: AngularFireDatabase,
  private navController: NavController,
  private router : ActivatedRoute,
  private locationService: LocationserviceService
  ) { }
@ViewChild('search') search : any;

categoryID : number;
fullStocks : AngularFireList<any>;
fullStocksCategory : AngularFireList<any>;
userEmail : string;
isAdmin : boolean = false;
searchInput : string;
searchVal : string;
productTempList = [];
  ngOnInit() {
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
							this.db.list('/properties/products/',ref => ref.orderByChild('productcode').equalTo(b['productcode'])).snapshotChanges().subscribe(res => {
								res.forEach(item => {
									let a = item.payload.toJSON();
									a['index'] = index;
									a['price'] = b['price'];
									a['discount'] = b['discount'];
									a['discountprice'] = b['discountprice'];
									firebase.database().ref('/profile/'+b['createdby']).once('value').then((snapshot) => {
										if(snapshot != null) {
											let distance = this.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),
															snapshot.child('latitude').val(),snapshot.child('longitude').val());
											a['distance'] = Math.round(distance * 100) / 100;
											this.stockList.push(a);
										}
									});
								});
							})
						}
					})
					this.productTempList = this.stockList;
				})
		  } else if(this.categoryID == 0) {
				firebase.database().ref('/productsforselling/').once('value').then((snapshot) => {
				  this.stockList = [];
				  this.productTempList = [];
					snapshot.forEach(item => {
						let b = item.toJSON();
						let index = item.key;
						if(b['available'] == 'Y') {
							this.db.list('/properties/products/',ref => ref.orderByChild('productcode').equalTo(b['productcode'])).snapshotChanges().subscribe(res => {
								res.forEach(item => {
									let a = item.payload.toJSON();
									a['index'] = index;
									a['price'] = b['price'];
									a['discount'] = b['discount'];
									a['discountprice'] = b['discountprice'];
									firebase.database().ref('/profile/'+b['createdby']).once('value').then((snapshot) => {
										if(snapshot != null) {
											let distance = this.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),
															snapshot.child('latitude').val(),snapshot.child('longitude').val());
											a['distance'] = Math.round(distance * 100) / 100;
											this.stockList.push(a);
										}
									});
								});
							})
						}
					})
					this.productTempList = this.stockList;
				})
			  } else {
				  firebase.database().ref('/productsforselling/').orderByChild('category').equalTo(this.categoryID).once('value').then((snapshot) => {
				  this.stockList = [];
				  this.productTempList = [];
					snapshot.forEach(item => {
						let b = item.toJSON();
						let index = item.key;
						if(b['available'] == 'Y') {
							this.db.list('/properties/products/',ref => ref.orderByChild('productcode').equalTo(b['productcode'])).snapshotChanges().subscribe(res => {
								res.forEach(item => {
									let a = item.payload.toJSON();
									a['index'] = index;
									a['price'] = b['price'];
									a['discount'] = b['discount'];
									a['discountprice'] = b['discountprice'];
									firebase.database().ref('/profile/'+b['createdby']).once('value').then((snapshot) => {
										if(snapshot != null) {
											let distance = this.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),
															snapshot.child('latitude').val(),snapshot.child('longitude').val());
											a['distance'] = Math.round(distance * 100) / 100;
											this.stockList.push(a);
										}
									});
								});
							});
							
						}
					})
					this.productTempList = this.stockList;
				})
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
