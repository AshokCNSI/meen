import { Component, OnInit, ViewChild  } from '@angular/core';
import * as firebase from 'firebase';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticateService } from '../authentication.service';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { NavController } from '@ionic/angular';
import { LocationserviceService } from '../locationservice.service';
import { LoadingService } from '../loading.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sellerproducts',
  templateUrl: './sellerproducts.page.html',
  styleUrls: ['./sellerproducts.page.scss'],
})
export class SellerproductsPage implements OnInit {
  public stockList = [];
  constructor(
  private activatedRoute: ActivatedRoute, 
  public fAuth: AngularFireAuth, 
  private authService: AuthenticateService,
  private db: AngularFireDatabase,
  private navController: NavController,
  private router : ActivatedRoute,
  private locationService: LocationserviceService,
  private loading : LoadingService,
  private location : Location
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
selleruid : string;
  ngOnInit() {
	  this.activatedRoute.queryParams.subscribe(params => {
		  this.selleruid = this.activatedRoute.snapshot.params['selleruid'];
		  firebase.database().ref('/productsforselling/').orderByChild('createdby').equalTo(this.selleruid).once('value').then((snapshot) => {
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

}