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
import { ModalController  } from '@ionic/angular';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-addressbook',
  templateUrl: './addressbook.page.html',
  styleUrls: ['./addressbook.page.scss'],
})
export class AddressbookPage implements OnInit {

  constructor(
  public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  private navController: NavController, 
  private router: Router,
  private db: AngularFireDatabase,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService,
  private geolocation: Geolocation,
  private nativeGeocoder: NativeGeocoder,
  private diagnostic: Diagnostic,
  public modalController: ModalController) { 
  
  }
  
  addressList = [];
  name : string;
  mobile : string;
  houseno : string;
  streetname : string;
  landmark : string;
  latitude : string;
  longitude : string;
  address : string;
  customeraddress : string;
  
  async presentAlert(status, msg) {
    const alert = await this.alertCtrl.create({
      header: status,
      message: msg,
      buttons: ['Ok']
    });
    await alert.present();
  }
  
  ngOnInit() {
	  
	  firebase.database().ref('/profile/'+this.authService.getUserID()).once('value').then((snapshot) => {
		  if(snapshot != null) {
			  this.customeraddress = snapshot.child('deliveryaddress').val();
		  }
	  });
	  
	  this.db.list('/addressbook', ref => ref.orderByChild('createdby').equalTo(this.authService.getUserID())).snapshotChanges().subscribe((snapshot) => {
		this.addressList = [];
		if(snapshot != null) {
			snapshot.forEach(item => {
				let a = item.payload.toJSON();
				a['index'] = item.key;
				this.addressList.push(a);
			});
		}
	});
  }
	
  selectAddress(addressindex):void {
		  firebase.database().ref('/profile/'+this.authService.getUserID()).update({
			   "deliveryaddress" : addressindex.index,
			   "modifieddate": Date(),
			   "modifiedby":this.authService.getUserID()
		  }).then(
		   res => 
		   {
			   this.presentAlert('Success','Your default address has been updated.');
		   }
		 ).catch(error => {
			this.presentAlert('Error',error);
		  });	
	  }
	  
	 deleteAddress(addressindex):void {
		 firebase.database().ref('/orders/').orderByChild('deliveryaddress').equalTo(addressindex).once('value').then((snapshot) => {
			if(snapshot != null) {
				this.presentAlert('Error',"You can't delete this address. As this alreday associated with your orders.");
			} else {
				firebase.database().ref('/addressbook/'+addressindex).remove().then(
				   res => 
				   {
					   this.presentAlert('Success','Your address has been deleted.');
				   }
				 ).catch(error => {
					this.presentAlert('Error',error);
				  });	
			}
		});
		  
	  }
}
