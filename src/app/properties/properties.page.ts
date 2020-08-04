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
  selector: 'app-properties',
  templateUrl: './properties.page.html',
  styleUrls: ['./properties.page.scss'],
})
export class PropertiesPage implements OnInit {

  constructor(
  public alertCtrl: AlertController, 
  public fAuth: AngularFireAuth, 
  private navController: NavController, 
  private router: Router,
  private db: AngularFireDatabase,
  private activatedRoute: ActivatedRoute,
  private routerService: RouterserviceService,
  private authService: AuthenticateService) { 
  
  }
  
  delieverycharge : number;
  masalacharge : number;
  state : string;
  district : string;
  stateList = [];
  locationMasterList = [];
  locationList = [];
  selectedArray = [];
  ngOnInit() {
	  firebase.database().ref('/properties/prop').once('value').then((snapshot) => {
		  this.delieverycharge = snapshot.child('delieverycharge').val();
		  this.masalacharge = snapshot.child('masalacharge').val();
	  });
	  firebase.database().ref('/properties/States').orderByChild('state_name').once('value').then((snapshot) => {
		  this.stateList = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			this.stateList.push(a);
		  })

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
				this.navController.navigateRoot('/home');
			} 
	  }}]
    });
    await alert.present();
  }
  
  updateProp() {
	  // Get a key for a new Post.
	  var propData = {
			"delieverycharge": this.delieverycharge,
			"masalacharge": this.masalacharge
	  };

	  var updates = {};
	  updates['/properties/prop'] = propData;
	  updates['/properties/location/'+this.state] = this.locationList;
;
	  return firebase.database().ref().update(updates).then(
	   res => 
	   {
		   this.presentAlert('Success','Properties updated successfully.');
	   }
	 );
	  
  }
  
  selectState($event) {
	  this.state = $event.target.value;
	  firebase.database().ref('/properties/location/'+this.state).once('value').then((snapshot) => {
		  this.locationList = [];
		  snapshot.forEach(item => {
			let a = item.toJSON();
			this.locationList.push(a);
		  })
	  });
  }
  
  selectLocation(data) {
	  var selectedData = data;
	  for(let i = 0; i < this.locationList.length; i++) {
		if(this.locationList[i].location_code == selectedData.location_code) {
			this.locationList[i].available = selectedData.available;
		}
	  }
  }
}
