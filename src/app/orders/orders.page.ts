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
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

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
  orderList = [];
  isAdmin : boolean = false;
  ngOnInit() {
	  if(this.authService.getUserType() == 'SA' || this.authService.getUserType() == 'A') {
		  this.isAdmin = true;
	  }
	  if(this.isAdmin) {
		  this.db.list('/orders').snapshotChanges().subscribe(res => { 
			  if(res != null) {
				  this.orderList = [];
				  res.forEach(item => {
					let a = item.payload.toJSON();
					a['index'] = item.key;
					let getStockDetail = this.db.object('/stock/'+a['productcode']);
					getStockDetail.snapshotChanges().subscribe(resp => { 
						a['product'] = resp.payload.toJSON();
					});
					if(a['currentstatus'] == 'ORD' || a['currentstatus'] == 'INP' || a['currentstatus'] == 'DE') {
						this.orderList.push(a);
					}
				  })
			  }
		});
	} else {
		  this.db.list('/orders', ref => ref.orderByChild('createdby').equalTo(this.authService.getUserID())).snapshotChanges().subscribe(res => { 
			  if(res != null) {
				  this.orderList = [];
				  res.forEach(item => {
					let a = item.payload.toJSON();
					a['index'] = item.key;
				  let getStockDetail = this.db.object('/stock/'+a['productcode']);
					getStockDetail.snapshotChanges().subscribe(resp => { 
						a['product'] = resp.payload.toJSON();
					});
					if(a['currentstatus'] == 'ORD' || a['currentstatus'] == 'INP' || a['currentstatus'] == 'DE' || a['currentstatus'] == 'CL') {
						this.orderList.push(a);
					}
				  })
			  }
			  	this.orderList.sort(this.comp);

		});
	  }
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
				this.navController.navigateRoot('/orders');
			}
	  }}]
    });
    await alert.present();
  }
  
  routeStockDetail(index,productcode){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : 'ORD'}});
  }
  
  comp(a, b) {
	return new Date(b.modifieddate).getTime() - new Date(a.modifieddate).getTime();
  }
}
