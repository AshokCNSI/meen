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
  private authService: AuthenticateService
) { 
  
  }
  
  orderRef: AngularFireObject<any>;
  isAdmin : boolean = false;
  cartList = [];
  ngOnInit() {
	  this.isAdmin = this.authService.getIsAdmin();
				
	  let getCartDetail = this.db.list('/orders', ref => ref.orderByChild('createdby').equalTo(this.authService.getUserID()));
	  getCartDetail.snapshotChanges().subscribe(res => { 
		  if(res != null) {
			  this.cartList = [];
			  res.forEach(item => {
				let a = item.payload.toJSON();
				a['index'] = item.key;
			  let getStockDetail = this.db.object('/stock/'+a['productcode']);
				getStockDetail.snapshotChanges().subscribe(resp => { 
					a['product'] = resp.payload.toJSON();
				});
				if(a['currentstatus'] == 'AC') {
					this.cartList.push(a);
				}
			  })
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
  
  routeStockDetail(index,productcode){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : 'AC'}});
  }
  
  deleteThisItem(index) {
	  firebase.database().ref('/orders/'+index).remove().then(data => {
		  this.presentAlert('Delete','Item has been successfully deleted.');
	  })
  }
}