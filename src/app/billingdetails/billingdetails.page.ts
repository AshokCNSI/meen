import { Component, OnInit, Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { ActivatedRoute, NavigationEnd, NavigationStart  } from '@angular/router';
import { Validators, FormBuilder, FormGroup, FormControl }from'@angular/forms';
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
import { DeliverylocationPage } from '../deliverylocation/deliverylocation.page';
import { LoginPage } from '../login/login.page';
import { RegisterPage } from '../register/register.page';
import { StockdetailPage } from '../stockdetail/stockdetail.page';

import { Location } from '@angular/common';
import { LoadingService } from '../loading.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-billingdetails',
  templateUrl: './billingdetails.page.html',
  styleUrls: ['./billingdetails.page.scss'],
})
export class BillingdetailsPage implements OnInit {

  constructor(
  public alertCtrl: AlertController,
  public formBuilder: FormBuilder, 
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
  private navParams: NavParams,
  private storage: Storage
) { 
  
  }
  Arr = Array;
  skeletoncount : number = 10;
  orderRef: AngularFireObject<any>;
  isAdmin : boolean = false;
  cartList = [];
  dname : string;
  dindex : string;
  dmobile : string;
  dhouseno : string;
  dstreetname : string;
  dlandmark : string;
  delieverycharge : number;
  masalacharge : number;
  totalAmount : number = 0;
  latitude : string;
  longitude : string;
  sellerlatitude : string;
  sellerlongitude : string;
  orderId : string;
  showMasala : boolean = false;
  masalaquantity : number = 1;
  cartListDetails =[];
  sellershopname : string;
  distance : number;
  
  async presentAlertWithLoginRegister(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : true,
      buttons: [{
          text: 'Login',
          handler: () => {
			this.openLogin();
	  }},{
          text: 'Register',
          handler: () => {
			this.openRegister();
	  }}]
    });
    await alert.present();
  }
  
  ngOnInit() {
	  this.isAdmin = this.authService.getIsAdmin();
	  
	  firebase.database().ref('/profile/'+this.authService.getUserID()).once('value').then((snapshot) => {
		  if(snapshot != null) {
			  firebase.database().ref('/addressbook/'+snapshot.child('deliveryaddress').val()).once('value').then((snapshot) => {
				if(snapshot != null) {
					this.dindex = snapshot.key;
					this.dname = snapshot.child('name').val();
					this.dmobile = snapshot.child('mobile').val();
					this.dhouseno = snapshot.child('houseno').val();
					this.dstreetname = snapshot.child('streetname').val();
					this.dlandmark = snapshot.child('landmark').val();
				}
			});
		  }
	  });
	  
	  firebase.database().ref('/properties/prop').once('value').then((snapshot) => {
		  this.delieverycharge = snapshot.child('delieverycharge').val();
		  this.masalacharge = snapshot.child('masalacharge').val();
	  });
	  
	  this.storage.get('cart').then((val) => {
		if(val) {
			this.cartListDetails = val;
		}
		this.cartListDetails.forEach(item => {
			firebase.database().ref('/productsforselling/'+item.item).once('value').then((snapshot) => {
				if(snapshot != null) {
					item.price = snapshot.child('price').val();
					item.index = snapshot.key;
					item.discount = snapshot.child('discount').val() == 'Y' ? snapshot.child('discountprice').val() : 0;
					firebase.database().ref('/properties/products/'+snapshot.child('productcode').val()).once('value').then((snapshot) => {
						if(snapshot != null) {
							item.title = snapshot.child('title').val();
							item.imagepath = snapshot.child('imagepath').val();
							item.quantity = item.itemcount;
							this.totalAmount = this.totalAmount + item.quantity * item.price - item.quantity * item.discount;
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
					this.distance = Math.round(distance * 100) / 100;
				}
			}).catch((error: any) => {
				
			});
		}
	  });
  }
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : false,
      buttons: [{
          text: 'Ok',
          handler: () => {
            if(status == 'Ordered'){
				this.navController.navigateRoot('/ordersuccess/'+this.orderId);
			} 
	  }}]
    });
    await alert.present();
  }
  
  async presentModal() {
    const modal = await this.modalController.create({
      component: MyaddressPage,
      cssClass: 'my-custom-class'
    });
	modal.onDidDismiss()
      .then((data) => {
		  if (data !== null) {
			this.dindex = data.data.index;
			this.dname = data.data.name;
			this.dmobile = data.data.mobile;
			this.dhouseno = data.data.houseno;
			this.dstreetname = data.data.streetname;
			this.dlandmark = data.data.landmark;
		  }
    });
    return await modal.present();
  }
  
  routeStockDetail(index,productcode,status){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : status}});
  }
  
  deleteThisItem(index) {
	  firebase.database().ref('/cart/'+index).remove().then(data => {
		  this.presentAlert('Delete','Item has been successfully deleted.');
	  })
  }
  
  selectAddress() {
	this.presentModal();
  }
 
  checkboxClick(e){
      if(e.target.checked) {
		  this.showMasala = true;
		  this.totalAmount = this.totalAmount + this.masalacharge;
	  } else {
		  this.showMasala = false;
		  this.totalAmount = this.totalAmount - (this.masalacharge * this.masalaquantity);
	  }
  }
  
  addMasalaQuantity() {
	  if((this.masalaquantity - 1) >= 10)
		  this.masalaquantity = 10;
	  else
		this.masalaquantity = this.masalaquantity + 1;
	
	this.totalAmount = this.totalAmount + this.masalacharge;
  }
  
  removeMasalaQuantity() {
	  if((this.masalaquantity - 1) <= 0) {
		  this.masalaquantity = 1;
	  } else {
		this.masalaquantity = this.masalaquantity - 1;
		this.totalAmount = this.totalAmount - this.masalacharge;
	  }
	
  }
  
  async openItemDetails(index) {
	const modal = await this.modalController.create({
	  component: StockdetailPage,
	  cssClass: 'stock-detail-modal-css',
	  componentProps: {
		itemid : this.cartList[index].index,
		desc : this.cartList[index].desc,
		options : this.cartList[index].options,
		pagemode : 'B'
	  }
	});
	modal.onDidDismiss()
      .then((data) => {
		  if (data !== null) {
			this.cartList[index].options = data.data.options;
			this.cartList[index].desc = data.data.desc ? data.data.desc : "";
			this.storage.set('cart', this.cartList);
		  }
    });
	await modal.present();
  }
  
  async openLogin() {
	const modal = await this.modalController.create({
	  component: LoginPage,
	  cssClass: 'my-custom-class',
	  componentProps: {
		pagemode : 'M'
	  }
	});
	await modal.present();
  }
  
  async openRegister() {
	const modal = await this.modalController.create({
	  component: RegisterPage,
	  cssClass: 'my-custom-class',
	  componentProps: {
		pagemode : 'M'
	  }
	});
	await modal.present();
  }
  
  confirmOrder() {
	  if(!this.authService.getIsUserLoggedIn()) {
		  this.presentAlertWithLoginRegister('Login','We are advising you to Login or Register to make sure all the transactions are safe with us.');
		  return;
		} else if(!this.dmobile) {
			this.presentAlert('Address','Please choose address to order.');
		} else {
			firebase.database().ref('/orders').push({
			"orderref" : Math.floor(Date.now() / 1000),
			"createddate" :  new Date().toLocaleString(),
			"createdby" : this.authService.getUserID(),
			"modifieddate": new Date().toLocaleString(),
			"modifiedby":this.authService.getUserID(),
			"totalamount" : this.totalAmount,
			"deliveryaddress" : this.dindex,
			"seller" : this.cartList[0].seller,
			"deliverycharge" : this.delieverycharge,
			"masalacharge" : this.masalacharge,
			"masalaquantity" : this.showMasala ? this.masalaquantity : 0,
			"currentstatus" : "ORD",
		  }).then(res => {
			   this.orderId = res.key;
			   this.cartList.forEach(function(key,value){
				   key['currentstatus'] = 'ORD';
				   firebase.database().ref('/orders/'+res.key+"/"+"items/").push(key)
				   .then(res => {
					    
				   })
			   })	
			   this.storage.remove('cart');
			   this.presentAlert('Ordered','Your item has been successfully ordered. Our executive will call you shortly.');
		   })
		}
  }
}