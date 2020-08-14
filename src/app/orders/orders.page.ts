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
	  if(this.authService.getUserType() == 'S') {
		  console.log(this.authService.getUserID())
		  this.db.list('/orders', ref => ref.orderByChild('seller').equalTo(this.authService.getUserID())).snapshotChanges().subscribe(res => { 
			  if(res != null) {
				  this.orderList = [];
				  res.forEach(item => {
					let a = item.payload.toJSON();
					a['index'] = item.key;
					a['price'] = a['sellingprice'];
					firebase.database().ref('/properties/products/'+a['productcode']).once('value').then((snapshot) => {
							if(snapshot != null) {
								a['title'] = snapshot.child('title').val();
								a['details'] = snapshot.child('details').val();
								a['imagepath'] = snapshot.child('imagepath').val();
								if(a['currentstatus'] != 'AC' || a['currentstatus'] == 'INP' || a['currentstatus'] == 'DE' || a['currentstatus'] == 'CL') {
									this.orderList.push(a);
								}
							}
						})
				  })
			  }
			  	this.orderList.sort(this.comp);

		});
	} else {
		  this.db.list('/orders', ref => ref.orderByChild('createdby').equalTo(this.authService.getUserID())).snapshotChanges().subscribe(res => { 
			  if(res != null) {
				  this.orderList = [];
				  res.forEach(item => {
					let a = item.payload.toJSON();
					a['index'] = item.key;
					a['price'] = a['sellingprice'];
					firebase.database().ref('/properties/products/'+a['productcode']).once('value').then((snapshot) => {
							if(snapshot != null) {
								a['title'] = snapshot.child('title').val();
								a['details'] = snapshot.child('details').val();
								a['imagepath'] = snapshot.child('imagepath').val();
								if(a['currentstatus'] == 'ORD' || a['currentstatus'] == 'INP' || a['currentstatus'] == 'DE' || a['currentstatus'] == 'CL') {
									this.orderList.push(a);
								}
							}
						})
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
