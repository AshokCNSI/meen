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
  discountPriceList = [];
  constructor(
  private activatedRoute: ActivatedRoute, 
  public fAuth: AngularFireAuth, 
  private authService: AuthenticateService,
  private db: AngularFireDatabase,
  private navController: NavController,
  private locationService : LocationserviceService
  ) { }

  ngOnInit() {
	  firebase.database().ref('/profile/').orderByChild('usertype').equalTo('S').once('value').then((snapshot) => {
		  snapshot.forEach(item => {
				let a = item.toJSON();
				let distance = this.locationService.getDistanceFromLatLonInKm(this.locationService.getLatitude(),this.locationService.getLongitude(),snapshot.child('latitude').val(),snapshot.child('longitude').val());
				a['distance'] = Math.round(distance * 100) / 100;
				firebase.database().ref('/productsforselling/').orderByChild('createdby').equalTo(a['createdby']).once('value').then((snapshot) => {
				  this.discountPriceList = [];
				  snapshot.forEach(item => {
					  let b = item.toJSON();
					  if(b['available'] == 'Y' && b['discount'] == 'Y' && b['discountprice'] > 0) {
						  this.discountPriceList.push(b['discountprice']);
					  }
				  })
				  if(this.discountPriceList.length > 0) {
					a['price'] = Math.max.apply(Math, this.discountPriceList);
					this.discountList.push(a);
				}
			  })
		  })
		  
	  })
  }

  routeStockDetail(index,productcode){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : 'R'}});
  }
  
}

