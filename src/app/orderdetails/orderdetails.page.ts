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
import { LoadingService } from '../loading.service';
import { MyaddressPage } from '../myaddress/myaddress.page';
import { ModalController, NavParams } from '@ionic/angular';
import { DeliverylocationPage } from '../deliverylocation/deliverylocation.page';
import { Location } from '@angular/common';
import { StockdetailPage } from '../stockdetail/stockdetail.page';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-orderdetails',
  templateUrl: './orderdetails.page.html',
  styleUrls: ['./orderdetails.page.scss'],
})
export class OrderdetailsPage implements OnInit {

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
  public loading: LoadingService,
  private modalController : ModalController,
  private location : Location,
  private navParams: NavParams
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
  productVisibility : string; 
  oldStatus : string;
  statusList = [];
  assignedto : string;
  latitude : string;
  longitude : string;
  sellerlatitude : string;
  sellerlongitude : string;
  orderid : string;
  seller : string;
  ngOnInit() {
	  this.isAdmin = this.authService.getIsAdmin();
	  firebase.database().ref('/properties/status').once('value').then((snapshot) => {
		  if(snapshot != null) {
			  snapshot.forEach(item =>{
				  let a = item.toJSON();
				  this.statusList.push(a);
			  })
		  }
	  });
	  this.activatedRoute.queryParams.subscribe(params => {
		  this.orderid = this.activatedRoute.snapshot.params['orderid'];
		  firebase.database().ref('/orders/'+this.orderid).once('value').then((snapshot) => {
			  if(snapshot != null) {
					firebase.database().ref('/addressbook/'+snapshot.child('deliveryaddress').val()).once('value').then((snapshot) => {
						if(snapshot != null) {
							this.dindex = snapshot.key;
							this.dname = snapshot.child('name').val();
							this.dmobile = snapshot.child('mobile').val();
							this.dhouseno = snapshot.child('houseno').val();
							this.dstreetname = snapshot.child('streetname').val();
							this.dlandmark = snapshot.child('landmark').val();
							this.latitude = snapshot.child('latitude').val();
							this.longitude = snapshot.child('longitude').val();
						}
					});
					this.delieverycharge = snapshot.child('delieverycharge').val();
					this.masalacharge = snapshot.child('masalacharge').val();
					this.totalAmount = snapshot.child('totalamount').val();
					this.productVisibility = snapshot.child('currentstatus').val();
					this.oldStatus = snapshot.child('currentstatus').val();
					this.seller = snapshot.child('seller').val();
					this.assignedto = snapshot.child('assignedto').val();
					snapshot.child('items').forEach(item => {
						let a = item.toJSON();
						this.cartList.push(a);
					})
					
					firebase.database().ref('/profile/'+this.seller).once('value').then((snapshot) => {
					if(snapshot != null) {
						this.sellerlatitude = snapshot.child('latitude').val();
						this.sellerlongitude = snapshot.child('longitude').val();
					}
				}).catch((error: any) => {
					
				});
			  }
		  });
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
            if(this.authService.getUserType() == 'S'){
				this.navController.navigateRoot('/orders');
			} else if(this.authService.getUserType() == 'D'){
				this.navController.navigateRoot('/myassignments');
			} else {
				console.log('/orderdetails/'+this.orderid)
				this.router.navigate(['/orderdetails/'+this.orderid]);
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
  
  
  updateOrder() {
	  this.loading.present();	
	  firebase.database().ref('/orders/'+this.orderid).update({
		"currentstatus": this.productVisibility,
		"modifieddate":new Date().toLocaleString(),
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
	  firebase.database().ref('/orders/'+this.orderid).update({
		"currentstatus": 'CL',
		"modifieddate":new Date(),
		"modifiedby":this.authService.getUserID()
	  }).then(
	   res => 
	   {
		   this.presentAlert('Status','Order cancelled successfully.');
	   }
	 )
	 this.loading.dismiss();	
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
  
  async openItemDetails(index) {
	  console.log(this.cartList[index].options)
	const modal = await this.modalController.create({
	  component: StockdetailPage,
	  cssClass: 'stock-detail-modal-css',
	  componentProps: {
		itemid : this.cartList[index].index,
		desc : this.cartList[index].desc,
		options : this.cartList[index].options
	  }
	});
	await modal.present();
  }
  
}