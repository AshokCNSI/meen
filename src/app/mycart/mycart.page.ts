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
  public loading: LoadingService
) { 
  
  }
  Arr = Array;
  skeletoncount : number = 10;
  orderRef: AngularFireObject<any>;
  isAdmin : boolean = false;
  shownoitems : boolean = false;
  cartList = [];
  ngOnInit() {
	  this.isAdmin = this.authService.getIsAdmin();
	  let getCartDetail = this.db.list('/cart', ref => ref.orderByChild('createdby').equalTo(this.authService.getUserID()));
	  getCartDetail.snapshotChanges().subscribe(res => { 
		  if(res != null) {
			  this.cartList = [];
			  res.forEach(item => {
				let a = item.payload.toJSON();
				a['index'] = item.key;
				firebase.database().ref('/productsforselling/'+a['orderedto']).once('value').then((snapshot) => {
					if(snapshot != null) {
						a['price'] = snapshot.child('price').val();
						a['productcode'] = snapshot.child('productcode').val();
						a['seller'] = snapshot.child('createdby').val();
						firebase.database().ref('/properties/products/'+snapshot.child('productcode').val()).once('value').then((snapshot) => {
							if(snapshot != null) {
								a['title'] = snapshot.child('title').val();
								a['details'] = snapshot.child('details').val();
								a['imagepath'] = snapshot.child('imagepath').val();
								if(a['currentstatus'] == 'AC') {
									this.cartList.push(a);
								}
							}
						})
					}
				});
			  })
			  if(this.cartList.length == 0) {
				  this.shownoitems = true;
			  }
		  }
	});
  }
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
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