
import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
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
import { DeliverylocationPage } from '../deliverylocation/deliverylocation.page';
import { Location } from '@angular/common';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-trackmyorder',
  templateUrl: './trackmyorder.page.html',
  styleUrls: ['./trackmyorder.page.scss'],
})
export class TrackmyorderPage implements OnInit {

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
  private modalController : ModalController,
  private location : Location
) { 
  
  }
  Arr = Array;
  skeletoncount : number = 10;
  statusList = [];
  currentIndex : number = 0;
  orderid : string;
  orderref : string;
  cartList = [];
  deliverycharge : string;
  masalacharge : string;
  totalAmount : string;
  productVisibility : string;
  
  ngAfterViewInit()
  {
	  
  }
  
  ngOnInit() {
	  this.activatedRoute.queryParams.subscribe(params => {
		  this.orderid = this.activatedRoute.snapshot.params['orderid'];
		  this.currentIndex = this.activatedRoute.snapshot.params['statusindex'];
		  firebase.database().ref('/properties/status').once('value').then((snapshot) => {
			  if(snapshot != null) {
				  snapshot.forEach(item =>{
					  let a = item.toJSON();
					  this.statusList.push(a);
				  })
			  }
		  });
		  firebase.database().ref('/orders/'+this.orderid).once('value').then((snapshot) => {
			  if(snapshot != null) {
					this.productVisibility = snapshot.child('currentstatus').val();
					this.deliverycharge = snapshot.child('deliverycharge').val();
					this.masalacharge = snapshot.child('masalacharge').val();
					this.totalAmount = snapshot.child('totalamount').val();
					this.orderref = snapshot.child('orderref').val();
					snapshot.child('items').forEach(item => {
						let a = item.toJSON();
						this.cartList.push(a);
					})
			  }
		  });
	  });
	  
  }

  routeStockDetail(index,productcode,status){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : status}});
  }
}