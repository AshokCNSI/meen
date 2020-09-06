import { Component, OnInit, Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, NavigationEnd, NavigationStart  } from '@angular/router';
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
  selector: 'app-myassignments',
  templateUrl: './myassignments.page.html',
  styleUrls: ['./myassignments.page.scss'],
})
export class MyassignmentsPage implements OnInit {

  
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

  cartList = [];
  statusList = [];
  ngOnInit() {	
		
		firebase.database().ref('/properties/status').once('value').then((snapshot) => {
		  if(snapshot != null) {
			  snapshot.forEach(item =>{
				  let a = item.toJSON();
				  this.statusList.push(a);
			  })
		  }
	  });
	  this.db.list('/orders', ref => ref.orderByChild('assignedto').equalTo(this.authService.getUserID())).snapshotChanges().subscribe(snapshot => { 
		  if(snapshot != null) {
			  this.cartList = [];
			  snapshot.forEach(item => {
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
								this.cartList.push(a);
								this.cartList.sort(function (a, b) {
									return new Date(b.modifieddate) - new Date(a.modifieddate);
								});
							}
						})
					}
				});
			  })
		  }
	})
  }
  
    
  ionViewWillEnter() {
	
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
}
