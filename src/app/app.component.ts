import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { environment } from '../environments/environment';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { AuthenticateService } from './authentication.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Network } from '@ionic-native/network/ngx';
import {  MenuController } from '@ionic/angular';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  public menuList = [];
  userEmail = null;
 
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
	private authService: AuthenticateService,
	private navController: NavController, 
	private router: Router,
	private db: AngularFireDatabase,
	private network: Network,
	private menuCtrl : MenuController,
	private geolocation: Geolocation,
	private nativeGeocoder: NativeGeocoder,
	private diagnostic: Diagnostic
  ) {
	
    this.initializeApp();
	// let status bar overlay webview
	this.statusBar.overlaysWebView(false);

	// set status bar to white
	this.statusBar.backgroundColorByHexString('#ffffff');
	
	// watch network for a disconnection
	
	let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
	  this.navController.navigateRoot('/network');
	});

	// stop disconnect watch
	//disconnectSubscription.unsubscribe();


	// watch network for a connection
	let connectSubscription = this.network.onConnect().subscribe(() => {
	  console.log('network connected!');
	  // We just got a connection but we need to wait briefly
	   // before we determine the connection type. Might need to wait.
	  // prior to doing any api requests as well.
	  setTimeout(() => {
		if (this.network.type === 'wifi') {
		  console.log('we got a wifi connection, woohoo!');
		}
	  }, 3000);
	});
	
	this.diagnostic.isLocationEnabled()
	  .then((state) => {
		if (!state){
		  this.navController.navigateRoot('/locationfinder');
		}
	  }).catch(e => console.log(e));
	// stop connect watch
	//connectSubscription.unsubscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  
  ngOnInit() {
	this.menuCtrl.enable(true);
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      //this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
	let menuRes = this.db.list('/menu', ref => ref.orderByChild('order'));	
	
	menuRes.snapshotChanges().subscribe(res => {
	  this.menuList = [];
	  res.forEach(item => {
		let a = item.payload.toJSON();
		a['$key'] = item.key;
		this.menuList.push(a);
	  })
	});
  }
  
  logout() {
	  this.authService.logoutUser()
      .then(res => {
        console.log(res);
		this.authService.setUserID(null);
		this.authService.setEmailID(null);
		this.authService.setIsUserLoggedIn(false);
		this.authService.setUserType(null);  
		this.authService.setUserName(null);  
        this.navController.navigateBack('');
      })
      .catch(error => {
        console.log(error);
      })
  }
}
