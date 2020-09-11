import { Component, OnInit, ViewChild  } from '@angular/core';
import * as firebase from 'firebase';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticateService } from '../authentication.service';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { NavController } from '@ionic/angular';
import { LocationserviceService } from '../locationservice.service';

import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})

export class NotificationPage implements OnInit {
	
  public discountList = [];
  userEmail : string;
  
  constructor(
  private activatedRoute: ActivatedRoute, 
  public fAuth: AngularFireAuth, 
  private authService: AuthenticateService,
  private db: AngularFireDatabase,
  private navController: NavController,
  private locationService : LocationserviceService
  ) { }

  ngOnInit() {
	  firebase.database().ref('/productsforselling/').once('value').then((snapshot) => {
	  this.discountList = [];
		snapshot.forEach(item => {
			let b = item.toJSON();
			let index = item.key;
			if(b['available'] == 'Y' && b['discount'] == 'Y' && b['discountprice'] > 0) {
				firebase.database().ref('/properties/products/').orderByChild('productcode').equalTo(b['productcode']).once('value').then((snapshot) => {
					snapshot.forEach(item => {
						let a = item.toJSON();
						a['index'] = index;
						a['price'] = b['price'];
						a['discount'] = b['discount'];
						a['discountprice'] = b['discountprice'];
						firebase.database().ref('/profile/'+b['createdby']).once('value').then((snapshot) => {
							if(snapshot != null) {
								
								let distance = this.locationService.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),snapshot.child('latitude').val(),snapshot.child('longitude').val());
								a['distance'] = Math.round(distance * 100) / 100;
								a['shopname'] = snapshot.child('shopname').val();
								this.discountList.push(a);
							}
						}).catch((error: any) => {
							
						});
					});
				}).catch((error: any) => {
					
				});
			}
		})
		
	}).catch((error: any) => {
		
	});
  }

  routeStockDetail(index,productcode){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : 'R'}});
  }
  
}

