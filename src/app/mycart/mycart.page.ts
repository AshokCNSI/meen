import { Component, OnInit, Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, NavigationEnd, NavigationStart  } from '@angular/router';
import{ Validators, FormGroup, FormControl }from'@angular/forms';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { filter } from 'rxjs/operators';
import { RouterserviceService } from '../routerservice.service';
import { AuthenticateService } from '../authentication.service';
import { LocationserviceService } from '../locationservice.service';

import { LoadingService } from '../loading.service';
import { timer } from 'rxjs';
import { Storage } from '@ionic/storage';
@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-mycart',
  templateUrl: './mycart.page.html',
  styleUrls: ['./mycart.page.scss'],
})
export class MycartPage implements OnInit {

  constructor(
  public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  private navController: NavController, 
  private router: Router,
  private db: AngularFireDatabase,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService,
  public loading: LoadingService,
  private storage: Storage,
  private locationService: LocationserviceService,
) { 
  
  }
  Arr = Array;
  skeletoncount : number = 10;
  orderRef: AngularFireObject<any>;
  isAdmin : boolean = false;
  shownoitems : boolean = false;
  cartList = [];
  cartListDetails = []
  sellername : string;
  sellershopname : string;
  sellerroute : string;
  selleruid : string;
  distance : number;
  sellerrating : number;
  
private increment (i, itemid) {
  this.cartList[i].quantity = this.cartList[i].quantity ? this.cartList[i].quantity + 1 : 1;
  let itempresent = false;
  this.cartList.forEach(item => {
	  if(item.item == itemid) {
		  itempresent = true;
		  item.itemcount = this.cartList[i].quantity;
	  }
  })
  
  if(!itempresent) {
	  this.cartList.push({
		  item : itemid,
		  itemcount : this.cartList[i].quantity,
		  seller : this.selleruid
	  })
  }
  this.storage.set('cart', this.cartList); 
}

private decrement (i, itemid) {
  this.cartList[i].quantity = this.cartList[i].quantity ? this.cartList[i].quantity - 1 : 0;
  let counter = 0;
  let itempresent = false;
  this.cartList.forEach(item => {
	  if(item.item == itemid) {
		  itempresent = true;
		  item.itemcount = this.cartList[i].quantity;
		  if(this.cartList[i].quantity == 0) {
			this.cartList.splice(counter, 1);
		  }
		  return;
	  }
	  counter++;
  })  
  this.storage.set('cart', this.cartList);  
}


  ngOnInit() {
	  this.isAdmin = this.authService.getIsAdmin();
	  this.storage.get('cart').then((val) => {
		if(val) {
			this.cartListDetails = val;
		}
		this.cartListDetails.forEach(item => {
			firebase.database().ref('/productsforselling/'+item.item).once('value').then((snapshot) => {
				if(snapshot != null) {
					item.price = snapshot.child('price').val();
					item.index = snapshot.key;
					firebase.database().ref('/properties/products/'+snapshot.child('productcode').val()).once('value').then((snapshot) => {
						if(snapshot != null) {
							item.title = snapshot.child('title').val();
							item.imagepath = snapshot.child('imagepath').val();
							item.quantity = item.itemcount;
							this.cartList.push(item);
						}
					})
				}
			})
		})
		
		if(this.cartListDetails[0]) {
			firebase.database().ref('/profile/'+this.cartListDetails[0].seller).once('value').then((snapshot) => {
				if(snapshot != null) {
					this.sellershopname = snapshot.child('shopname').val();
					let distance = this.locationService.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),
									snapshot.child('latitude').val(),snapshot.child('longitude').val());
					this.distance = Math.floor(Math.round(distance * 100) / 100);
					this.sellerrating = snapshot.child('rating').val();
					if(!this.sellerrating) {
						this.sellerrating = 0;
					}
				}
			}).catch((error: any) => {
				
			});
		}
	  });

	timer(3000).subscribe(() => {
		if(this.cartList.length == 0) {
		  this.shownoitems = true;
		}
	})
  }
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : false,
      buttons: [{
          text: 'Ok',
          handler: () => {
            if(status == 'Success') {
				this.navController.navigateRoot('/stock');
			} else if(status == 'Cart'){
				this.navController.navigateRoot('/mycart');
			} 
	  }}]
    });
    await alert.present();
  }
  
  routeStockDetail(index,productcode,status){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : status}});
  }
  
  deleteThisItem(index) {
	  firebase.database().ref('/cart/'+index).remove().then(data => {
		  this.presentAlert('Delete','Item has been successfully deleted.');
	  })
  }
  
  clearCart() {
	 this.presentAlertWithCancel('ClearCart','We found that this item is not belongs to the current seller. Press ok to clear the cart and try to add this item again.');
  }
  
  async presentAlertWithCancel(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : false,
      buttons: [{
          text: 'Ok',
          handler: () => {
		  if(status == 'ClearCart') {
			this.cartList.forEach(function(key,value){
				   firebase.database().ref('/cart/'+key.index).remove().then(data => {
					  
				   })
			   })
		  } 
	  }},{text : 'Cancel'}]
    });
    await alert.present();
  }
}