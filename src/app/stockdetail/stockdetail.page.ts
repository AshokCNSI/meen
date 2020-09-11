import { Component, OnInit, Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, NavigationEnd, NavigationStart  } from '@angular/router';
import{ Validators, FormBuilder, FormGroup, FormControl }from'@angular/forms';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { filter } from 'rxjs/operators';
import { RouterserviceService } from '../routerservice.service';
import { AuthenticateService } from '../authentication.service';
import { LocationserviceService } from '../locationservice.service';
import { ModalController } from '@ionic/angular';
import { MyaddressPage } from '../myaddress/myaddress.page';
import { DeliverylocationPage } from '../deliverylocation/deliverylocation.page';
import { LoginPage } from '../login/login.page';
import { RegisterPage } from '../register/register.page';

import { Location } from '@angular/common';
import { LoadingService } from '../loading.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { prop } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-stockdetail',
  templateUrl: './stockdetail.page.html',
  styleUrls: ['./stockdetail.page.scss'],
})
export class StockdetailPage implements OnInit {

	
  constructor(
  public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
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
  private geolocation: Geolocation
) { 
	
  }
  
  stockRef: AngularFireObject<any>;
  getStockDetail : AngularFireObject<any>;
  getOrderDetail : AngularFireObject<any>;
  getOrderDetailList = [];
	//
  uid : string;
  productcode: string;
  seller : string;
  stockDetail = [];
  stockDetailS = [];
  isSubmitted = false;
  delieverycharge : number;
  masalacharge : number;
  title: string; 
  available : string;
  discount : number;
  discountprice : number;
  price : number;
  details : string;
  imagepath : string;
  fishsize : {};
  category : string;
  stock :number;
  isAdmin : boolean = false;
  masala : string;
  quantity : number = 1;
  cookingpurpose : string;
  description : string;
  orderDetailS = {};
  backUrl : string;
  oldStatus : string;
  ordervisibility : boolean = false;
  isUserLoggedIn : boolean = false;
  isProfileCreated : boolean = false;
  productVisibility : string;
  firstname: string; 
  lastname : string;
  mobilenumber : number;
  street1 : string;
  street2 : string;
  district : string;
  state : string;
  pincode : number;
  index : string;
  ofinalprice:number;
  oactualprice:number;
  osellingprice:number;
  odiscountprice:number;
  ototalprice:number;
  odeliverycharge:number;
  omasalacharge:number;
  omasalatotalcharge : number;
  dname : string;
  dindex : string;
  dmobile : string;
  dhouseno : string;
  dstreetname : string;
  dlandmark : string;
  statusList = [];
  assignedto : string;
  masalaquantity : number = 1;
  latitude : string;
  longitude : string;
  current_lat : string;
  current_long : string;
  sellerlatitude : string;
  sellerlongitude : string;
  cartList = [];
  shopname : string;
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
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : false,
      buttons: [{
          text: 'Ok',
          handler: () => {
		  if(status == 'Login') {
			this.openLogin();
		  } else {
			this.location.back();
		  }
	  }}]
    });
    await alert.present();
  }
  
  async presentAlertWithLoginRegister(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
	  backdropDismiss : false,
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
  
  ngOnInit() {
	  this.loading.present();
	  if(this.authService.getIsUserLoggedIn()) {
	    firebase.database().ref('/cart').orderByChild('createdby').equalTo(this.authService.getUserID()).once('value').then((snapshot) => {
		  if(snapshot != null) {
			  this.cartList = [];
			  snapshot.forEach(item => {
				let a = item.toJSON();
					a['index'] = item.key;
					firebase.database().ref('/productsforselling/'+a['orderedto']).once('value').then((snapshot) => {
						if(snapshot != null) {
							a['seller'] = snapshot.child('createdby').val();
							firebase.database().ref('/properties/products/'+snapshot.child('productcode').val()).once('value').then((snapshot) => {
								if(snapshot != null) {
									if(a['currentstatus'] == 'AC') {
										this.cartList.push(a);
									}
								}
							})
						}
					});
				  })
			  }
		});
	  }
	  firebase.database().ref('/properties/status').once('value').then((snapshot) => {
		  if(snapshot != null) {
			  snapshot.forEach(item =>{
				  let a = item.toJSON();
				  this.statusList.push(a);
			  })
		  }
	  });
	  firebase.database().ref('/properties/prop').once('value').then((snapshot) => {
		  this.delieverycharge = snapshot.child('delieverycharge').val();
		  this.masalacharge = snapshot.child('masalacharge').val();
	  });
		
		this.activatedRoute.queryParams.subscribe(params => {
		  this.productcode = params['productcode'];
		  this.productVisibility = params['status'];
		  this.index = params['index'];
		});
		
		if(this.productVisibility == 'ORD') {
			this.backUrl = '/orders';
		} else if(this.productVisibility == 'AC') {
			this.backUrl = '/mycart';
		} else {
			this.backUrl = '/stock/0';
		}
		
		if(this.productVisibility != 'R') {
			  firebase.database().ref('/cart/'+this.index).once('value').then((snapshot) => {
				  this.masala = snapshot.child('masala').val();
				  this.masalaquantity = snapshot.child('masalaquantity').val();
				  this.quantity = snapshot.child('quantity').val();
				  this.description = snapshot.child('description').val();
				  this.cookingpurpose = snapshot.child('cookingpurpose').val();
				  this.productVisibility = snapshot.child('currentstatus').val();
				  this.oldStatus = snapshot.child('currentstatus').val();
				  this.assignedto = snapshot.child('assignedto').val();;
				  
				  this.ofinalprice = snapshot.child('finalprice').val();
				  this.oactualprice = snapshot.child('actualprice').val();
				  this.osellingprice = snapshot.child('sellingprice').val();
				  this.odiscountprice = snapshot.child('discountprice').val();
				  this.ototalprice = snapshot.child('totalprice').val();
				  this.odeliverycharge = snapshot.child('deliverycharge').val();
				  this.omasalacharge = snapshot.child('masalacharge').val();
				  this.omasalatotalcharge = snapshot.child('masalatotalcharge').val();
				  
				  if(this.productVisibility != 'AC') {
					  this.ordervisibility = true;
				  }
				  this.dindex = snapshot.child('deliveryaddress').val();
				  firebase.database().ref('/addressbook/'+snapshot.child('deliveryaddress').val()).once('value').then((snapshot) => {
					if(snapshot != null) {
						this.dname = snapshot.child('name').val();
						this.dmobile = snapshot.child('mobile').val();
						this.dhouseno = snapshot.child('houseno').val();
						this.dstreetname = snapshot.child('streetname').val();
						this.dlandmark = snapshot.child('landmark').val();
						this.latitude = snapshot.child('latitude').val();
						this.longitude = snapshot.child('longitude').val();
					}
				});
				  
				  firebase.database().ref('/productsforselling/'+snapshot.child('orderedto').val()).once('value').then((snapshot) => {
					if(snapshot != null) {
						this.price = snapshot.child('price').val();
						this.productcode = snapshot.child('productcode').val();
						this.seller = snapshot.child('createdby').val();
						this.discountprice = snapshot.child('discountprice').val();
						firebase.database().ref('/properties/products/'+snapshot.child('productcode').val()).once('value').then((snapshot) => {
							if(snapshot != null) {
								this.title = snapshot.child('title').val();
								this.details = snapshot.child('details').val();
								this.imagepath = snapshot.child('imagepath').val();
							}
						})
						firebase.database().ref('/profile/'+this.seller).once('value').then((snapshot) => {
							if(snapshot != null) {
								this.sellerlatitude = snapshot.child('latitude').val();
								this.sellerlongitude = snapshot.child('longitude').val();
								this.shopname = snapshot.child('shopname').val();
							}
						}).catch((error: any) => {
							
						});
					}
				});
			  });
		  } else {
			   firebase.database().ref('/productsforselling/'+this.index).once('value').then((snapshot) => {
					if(snapshot != null) {
						this.price = snapshot.child('price').val();
						this.productcode = snapshot.child('productcode').val();
						this.seller = snapshot.child('createdby').val();
						firebase.database().ref('/properties/products/'+snapshot.child('productcode').val()).once('value').then((snapshot) => {
							if(snapshot != null) {
								this.title = snapshot.child('title').val();
								this.details = snapshot.child('details').val();
								this.imagepath = snapshot.child('imagepath').val();
							}
						})
						firebase.database().ref('/profile/'+this.seller).once('value').then((snapshot) => {
							if(snapshot != null) {
								this.shopname = snapshot.child('shopname').val();
							}
						}).catch((error: any) => {
							
						});
					}
				});
		  }
	 this.loading.dismiss();
  }
  
  formData = this.formBuilder.group({
	   title: ['', [Validators.required]],
	   details: ['', []],
	   imagepath: ['', []]
	});
  
  orderData = this.formBuilder.group({
	   quantity: ['', [Validators.required]],
	   cookingpurpose: ['', [Validators.required]],
	   masala: ['', [Validators.required]],
	   masalaquantity : [''],
	   description: ['']
	});
	
  get errorControl() {
		return this.formData.controls;
	  }
	get errorOrderControl() {
		return this.orderData.controls;
	  }

  saveStock() {
	  this.isSubmitted = true;
	  if (!this.formData.valid) {
		return false;
	  } else {		
		firebase.database().ref('/properties/products/'+this.productcode).set({
		   productcode : this.productcode,
		   title: this.title,
		   details: this.details,
		   imagepath: this.imagepath
		  }).then(
		   res => 
		   {
			   this.presentAlert('Success','Stock updated successfully.');
		   }
		 ).catch(error => {
			this.presentAlert('Error',error);
		  });
	  }
  }
  
  addToCart() {
	  
	  this.isSubmitted = true;
	  if (!this.orderData.valid) {
		return false;
	  } else {
		if(!this.authService.getIsUserLoggedIn()) {
		  this.presentAlertWithLoginRegister('Login','We are advising you to Login or Register to make sure all the transactions are safe with us.');
		  return;
		} else if(this.cartList.length != 0 && this.cartList[0].seller != this.seller) {
		   this.presentAlertWithCancel('ClearCart','We found that this item is not belongs to the current seller. Press ok to clear the cart and try to add this item again.');
		   return;
		}
		this.loading.present();		  
		firebase.database().ref('/cart').push({
			"productcode": this.productcode,
			"quantity": this.orderData.value.quantity,
			"masala": this.orderData.value.masala,
			"masalaquantity" : this.orderData.value.masalaquantity,
			"cookingpurpose": this.orderData.value.cookingpurpose,
			"currentstatus": "AC",
			"orderedto" : this.index,
			"seller" : this.seller,
			"description" : this.orderData.value.description,
			"createddate" : new Date().toLocaleString(),
			"createdby":this.authService.getUserID(),
			"modifieddate": new Date().toLocaleString(),
			"modifiedby":this.authService.getUserID()
		  }).then(res => { this.presentAlert('Cart','Product added to cart successfully.');})
			.catch(res => {console.log(res)})
	  }
	 this.loading.dismiss();
  }
  
  updateCart() {
	  this.isSubmitted = true;
	  if (!this.orderData.valid) {
		return false;
	  } else {
		
		this.loading.present();		  
		firebase.database().ref('/cart/'+this.index).update({
			"quantity": this.orderData.value.quantity,
			"masala": this.orderData.value.masala,
			"masalaquantity" : this.orderData.value.masalaquantity,
			"cookingpurpose": this.orderData.value.cookingpurpose,
			"description" : this.orderData.value.description,
			"modifieddate": new Date().toLocaleString(),
			"modifiedby":this.authService.getUserID()
		  }).then(res => { this.presentAlert('Cart','Product Updated to cart successfully.');})
			.catch(res => {console.log(res)})
	  }
	 this.loading.dismiss();
  }
  
  clearCart() {
	 this.presentAlertWithCancel('ClearCart','We found that this item is not belongs to the current seller. Press ok to clear the cart and try to add this item again.');
  }
  
  updateStatus() {
	  this.loading.present();	
	  firebase.database().ref('/orders/'+this.index).update({
		"currentstatus": this.productVisibility,
		"modifieddate":new Date(),
		"modifiedby":this.authService.getUserID(),
		"assignedto" : this.productVisibility == 'DS' || (this.assignedto == this.authService.getUserID() && this.productVisibility != 'WFP') ? this.authService.getUserID() : ""
	  }).then(
	   res => 
	   {
		   this.presentAlert('Status','Status updated successfully.');
	   }
	 )
	 this.loading.dismiss();	
  }
  
  cancelOrder() {
	  this.loading.present();	
	  firebase.database().ref('/orders/'+this.index).update({
		"currentstatus": 'CL',
		"modifieddate":new Date().toLocaleString(),
		"modifiedby":this.authService.getUserID(),
		"finalprice":(this.price * this.quantity + prop.delieverycharge),
		"actualprice":(this.price + this.discountprice),
		"sellingprice":(this.price),
		"discountprice":(this.discountprice),
		"totalprice":(this.price * this.quantity),
		"deliverycharge":(prop.delieverycharge),
		"masalacharge":(prop.masalacharge),
		"masalatotalcharge":(this.masala == 'Y' ? this.quantity * this.masalacharge : 0)
	  }).then(
	   res => 
	   {
		   this.presentAlert('Status','Order cancelled successfully.');
	   }
	 )
	 this.loading.dismiss();	
  }
  selectAddress() {
	this.presentModal();
  }
  
  addNumber() {
	  if((this.quantity - 1) >= 10)
		  this.quantity = 10;
	  else
		this.quantity = this.quantity + 1;
  }
  
  removeNumber() {
	  if((this.quantity - 1) <= 1)
		  this.quantity = 1;
	  else
		this.quantity = this.quantity - 1;
  }
  
  addMasalaQuantity() {
	  if((this.masalaquantity - 1) >= 10)
		  this.masalaquantity = 10;
	  else
		this.masalaquantity = this.masalaquantity + 1;
  }
  
  removeMasalaQuantity() {
	  if((this.masalaquantity - 1) <= 0)
		  this.masalaquantity = 0;
	  else
		this.masalaquantity = this.masalaquantity - 1;
  }
  
  async goToClientLocation() {
	const modal = await this.modalController.create({
	  component: DeliverylocationPage,
	  cssClass: 'my-custom-class',
	  componentProps: {
		destinationlatitude: this.productVisibility == 'DS' ? this.sellerlatitude : this.latitude,
		destinationlongitude: this.productVisibility == 'DS' ? this.sellerlongitude : this.longitude
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

}
