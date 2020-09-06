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
import { LoadingService } from '../loading.service';
import { MyaddressPage } from '../myaddress/myaddress.page';
import { ModalController } from '@ionic/angular';

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
  public fAuth: AngularFireAuth, 
  private navController: NavController, 
  private router: Router,
  private db: AngularFireDatabase,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService,
  public loading: LoadingService,
  private modalController : ModalController
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
	  
	  firebase.database().ref('/cart').orderByChild('createdby').equalTo(this.authService.getUserID()).once('value').then((snapshot) => {
		  if(snapshot != null) {
			  this.cartList = [];
			  snapshot.forEach(item => {
				let a = item.toJSON();
				a['index'] = item.key;
				firebase.database().ref('/productsforselling/'+a['orderedto']).once('value').then((snapshot) => {
					if(snapshot != null) {
						a['price'] = snapshot.child('price').val();
						a['discount'] = snapshot.child('discount').val() == 'Y' ? snapshot.child('discountprice').val() : 0;
						a['productcode'] = snapshot.child('productcode').val();
						a['seller'] = snapshot.child('createdby').val();
						firebase.database().ref('/properties/products/'+snapshot.child('productcode').val()).once('value').then((snapshot) => {
							if(snapshot != null) {
								a['title'] = snapshot.child('title').val();
								a['details'] = snapshot.child('details').val();
								a['imagepath'] = snapshot.child('imagepath').val();
								if(a['currentstatus'] == 'AC') {
									this.totalAmount = this.totalAmount + a['quantity'] * a['price'] - a['quantity'] * a['discount'] + ((a['masala'] == 'Y' && a['masalaquantity']) ? (a['masalaquantity'] * this.masalacharge):0);
									this.cartList.push(a);
									this.cartList.sort(function (a, b) {
										return (new Date(b.modifieddate).getTime() - new Date(a.modifieddate).getTime());
									});
								}
							}
						})
					}
				});
			  })
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
				this.navController.navigateRoot('/orders');
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
  
  confirmOrder() {
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
			"currentstatus" : "ORD"
		  }).then(res => {
			   this.cartList.forEach(function(key,value){
				   key['currentstatus'] = 'ORD';
				   firebase.database().ref('/orders/'+res.key+"/"+"items/").push(key)
				   .then(res => {
					   
				   })
				   firebase.database().ref('/cart/'+key.index).update({
					   "currentstatus" : 'ORD'
				   }).then(data => {
					  
				   })
			   })
			   this.presentAlert('Ordered','Your item has been successfully ordered. Our executive will call you shortly.');
		   })
  }
  
}