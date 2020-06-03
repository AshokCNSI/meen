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
  private authService: AuthenticateService
) { 
  
  }
  
  stockRef: AngularFireObject<any>;
  getStockDetail : AngularFireObject<any>;
  getOrderDetail : AngularFireObject<any>;
  getOrderDetailList = [];
	//
 uid : string;
  productcode: string;
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
  quantity : number;
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
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
      buttons: [{
          text: 'Ok',
          handler: () => {
            if(status == 'Success') {
				this.navController.navigateRoot('/stock/0');
			} else if(status == 'Ordered'){
				this.navController.navigateRoot('/orders');
			} else if(status == 'Cart'){
				this.navController.navigateRoot('/mycart');
			} else if(status == 'Status'){
				this.navController.navigateRoot('/orders');
			} else if(status == 'Login'){
				this.navController.navigateRoot('/login');
			} else if(status == 'Profile'){
				this.navController.navigateRoot('/profile');
			}
	  }}]
    });
    await alert.present();
  }
  
  ngOnInit() {
	  this.delieverycharge = prop.delieverycharge;
	  this.masalacharge = prop.masalacharge;
		firebase.auth().onAuthStateChanged(user => {
		  if (user) {
			  this.isUserLoggedIn = true;
		  } 
		});
		firebase.database().ref('/profile/'+this.authService.getUserID()).once('value').then((snapshot) => {
		  if(snapshot.child('mobilenumber').val() == null) {
			  this.isProfileCreated = true;
		  }
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
		if(this.productVisibility == 'ORD' || this.productVisibility == 'AC') {
			  firebase.database().ref('/orders/'+this.index).once('value').then((snapshot) => {
				  this.masala = snapshot.child('masala').val();
				  this.quantity = snapshot.child('quantity').val();
				  this.description = snapshot.child('description').val();
				  this.cookingpurpose = snapshot.child('cookingpurpose').val();
				  this.productVisibility = snapshot.child('currentstatus').val();
				  this.oldStatus = snapshot.child('currentstatus').val();
				  
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
				  firebase.database().ref('/stock/'+snapshot.child('productcode').val()).once('value').then((snapshot) => {
					  this.title = snapshot.child('title').val();
					  this.price = snapshot.child('price').val();
					  this.discountprice = snapshot.child('discountprice').val();
					  this.details = snapshot.child('details').val();
					  this.imagepath = snapshot.child('imagepath').val();
				  });
				  firebase.database().ref('/profile/'+snapshot.child('createdby').val()).once('value').then((snapshot) => {
					  this.firstname = snapshot.child('firstname').val();
					  this.lastname = snapshot.child('lastname').val();
					  this.mobilenumber = snapshot.child('mobilenumber').val();
					  this.street1 = snapshot.child('street1').val();
					  this.street2 = snapshot.child('street2').val();
					  this.district = snapshot.child('district').val();
					  this.state = snapshot.child('state').val();
					  this.pincode = snapshot.child('pincode').val();
				  });
			  });
		  } else {
			   firebase.database().ref('/stock/'+this.productcode).once('value').then((snapshot) => {
				  this.title = snapshot.child('title').val();
				  this.available = snapshot.child('available').val();
				  this.discount = snapshot.child('discount').val();
				  this.discountprice = snapshot.child('discountprice').val();
				  this.price = snapshot.child('price').val();
				  this.details = snapshot.child('details').val();
				  this.imagepath = snapshot.child('imagepath').val();
				  this.fishsize = Array.from(snapshot.child('fishsize').val());
				  this.category = snapshot.child('category').val();
				  this.stock = snapshot.child('stock').val();
			  });
		  }
	  
		if(this.authService.getUserType() == 'SA' || this.authService.getUserType() == 'A') {
			this.isAdmin = true;
		}
			  
  }
  
  formData = this.formBuilder.group({
	   title: ['', [Validators.required]],
	   available: ['', [Validators.required]],
	   discount: ['', [Validators.required]],
	   discountprice: ['', [Validators.required]],
	   price: ['', [Validators.required]],
	   details: ['', []],
	   imagepath: ['', []],
	   fishsize: ['', [Validators.required]],
	   category: ['', [Validators.required]],
	   stock: ['', [Validators.required]]
	});
  
  orderData = this.formBuilder.group({
	   quantity: ['', [Validators.required]],
	   cookingpurpose: ['', [Validators.required]],
	   masala: ['', [Validators.required]],
	   description: ['', [Validators.required]]
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
		firebase.database().ref('/stock/'+this.productcode).set({
		   productcode : this.productcode,
		   title: this.title,
		   available: this.available,
		   discount: this.discount,
		   discountprice: this.discountprice,
		   price: this.price,
		   details: this.details,
		   imagepath: this.imagepath,
		   fishsize: (this.fishsize).toString(),
		   category: this.category,
		   stock: this.stock
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
	  if(this.isUserLoggedIn) {
	  this.isSubmitted = true;
	  if (!this.orderData.valid) {
		return false;
	  } else {		
		firebase.database().ref('/orders').push({
			"productcode": this.productcode,
			"quantity": this.orderData.value.quantity,
			"masala": this.orderData.value.masala,
			"cookingpurpose": this.orderData.value.cookingpurpose,
			"currentstatus": "AC",
			"description" : this.orderData.value.description,
			"createddate" : Date(),
			"createdby":this.authService.getUserID(),
			"modifieddate": Date(),
			"modifiedby":this.authService.getUserID()
		  }).then(
		   res => 
		   {
			   this.presentAlert('Cart','Product added to cart successfully.');
		   }
		 )
	  }
	 } else {
		 this.presentAlert('Login','We are advising you to Login to make sure all the transactions are safe with us.');
	 }
  }
  
  orderConfirm() {
	  if(!this.isProfileCreated) {
	  this.isSubmitted = true;
	  if (!this.orderData.valid) {
		return false;
	  } else {		 
		firebase.database().ref('/orders/'+this.index).update({
			"productcode": this.productcode,
			"quantity": this.orderData.value.quantity,
			"masala": this.orderData.value.masala,
			"cookingpurpose": this.orderData.value.cookingpurpose,
			"currentstatus": "ORD",
			"description" : this.orderData.value.description,
			"modifieddate":new Date(),
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
			   this.presentAlert('Ordered','Your item has been successfully ordered. Our executive will call you shortly.');
		   }
		 )
		}
	  } else {
		  this.presentAlert('Profile','We are advising you to update profile to make sure all the transactions are safe with us.');
	  }
  }
  
  updateStatus() {
	  firebase.database().ref('/orders/'+this.index).update({
		"currentstatus": this.productVisibility,
		"modifieddate":new Date(),
		"modifiedby":this.authService.getUserID()
	  }).then(
	   res => 
	   {
		   this.presentAlert('Status','Status updated successfully.');
	   }
	 )
  }
  
  cancelOrder() {
	  firebase.database().ref('/orders/'+this.index).update({
		"currentstatus": 'CL',
		"modifieddate":new Date(),
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
  }

}
