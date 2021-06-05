import { Component, OnInit } from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { environment } from '../environments/environment';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { AuthenticateService } from './authentication.service';
import { NavController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import {  MenuController } from '@ionic/angular';
import { LocationserviceService } from './locationservice.service';
import { LoadingService } from './loading.service';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { timer } from 'rxjs';
import { FCM } from '@ionic-native/fcm/ngx';
import { EventsService } from './events.service';

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
  showSplash : boolean = true;
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
	private diagnostic: Diagnostic,
	private locationService: LocationserviceService,
	private loading : LoadingService,
	private modalController : ModalController,
	private fcm: FCM,
	private events: EventsService
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
	let options: NativeGeocoderOptions = {
		useLocale: true,
		maxResults: 5
	};
	//this.locationService.setLatitude("11.330400");
	//this.locationService.setLongitude("77.747223");
	//this.locationService.setCurrentLocation("Kollampalayam, Erode.");
	if(this.locationService.getLatitude() == undefined || this.locationService.getLatitude() == "" 
		|| this.locationService.getLongitude() == undefined || this.locationService.getLongitude() == ""
		|| this.locationService.getCurrentLocation() == undefined || this.locationService.getCurrentLocation() == "") {
		this.geolocation.getCurrentPosition().then((resp) => {
		 this.locationService.setLatitude(resp.coords.latitude.toString());
		 this.locationService.setLongitude(resp.coords.longitude.toString());
		 this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
			.then((result: NativeGeocoderResult[]) => {
				this.locationService.setCurrentLocation(this.generateAddress(result[0]));
			})
			.catch((error: any) => {
				//this.navController.navigateRoot('/locationfinder');
			});
		}).catch((error) => {
		  console.log('Error getting location', error);
		});
	}

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
	
	// stop connect watch
	//connectSubscription.unsubscribe();
	
	router.events.subscribe( (event: Event) => {
		if (event instanceof NavigationStart) {
			
		}

		if (event instanceof NavigationEnd) {
			console.log("Start");
		}

		if (event instanceof NavigationError) {
			console.log(event.error);
		}
	});

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
	  this.authService.userDetails().subscribe(res => { 
		if (res !== null) {
			this.authService.setUserName(res.email);
			this.authService.setUserID(res.uid);
			this.authService.setEmailID(res.email);
			this.authService.setIsUserLoggedIn(true);
			firebase.database().ref('/profile/'+res.uid).once('value').then((snapshot) => {
				if(snapshot != null) {
					this.authService.setUserType(snapshot.child('usertype').val());  
					this.authService.setUserName(snapshot.child('firstname').val()+" "+snapshot.child('lastname').val());
					timer(2000).subscribe(() => this.showSplash = false);
				}
			})
		} else {
			this.authService.setIsUserLoggedIn(false);
			timer(2000).subscribe(() => this.showSplash = false);
		}
	  }, err => {
		  console.log('err', err);
	 })
	  this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
	  
	  this.diagnostic.isLocationEnabled()
	  .then((state) => {
		if (!state){
		  this.navController.navigateRoot('/locationfinder');
		} else {
			this.authService.userDetails().subscribe(res => { 
				if (res !== null) {
					firebase.database().ref('/profile/'+res.uid).once('value').then((snapshot) => {
						if(snapshot != null) {
							if(!snapshot.toJSON()) {
								this.navController.navigateRoot('/customerdetails');
							}
						}
					})
				} else {
					this.navController.navigateRoot('/mobilelogin');
				}
			  }, err => {
				  console.log('err', err);
			 })
		}
	  }).catch(e => console.log(e));
	  
	  // subscribe to a topic
      // this.fcm.subscribeToTopic('Deals');

      // get FCM token
      this.fcm.getToken().then(token => {
        console.log(token);
      });

      // ionic push notification example
      this.fcm.onNotification().subscribe(data => {
        console.log(data);
        if (data.wasTapped) {
          console.log('Received in background');
        } else {
          console.log('Received in foreground');
        }
      });      

      // refresh the FCM token
      this.fcm.onTokenRefresh().subscribe(token => {
        console.log(token);
      });
    });

	this.events.getObservable().subscribe((data) => {
		console.log("Data received:", data);
		this.authService.userDetails().subscribe(res => { 
			if (res !== null) {
				this.authService.setUserName(res.email);
				this.authService.setUserID(res.uid);
				this.authService.setEmailID(res.email);
				this.authService.setIsUserLoggedIn(true);
				firebase.database().ref('/profile/'+res.uid).once('value').then((snapshot) => {
					if(snapshot != null) {
						this.authService.setUserType(snapshot.child('usertype').val());  
						this.authService.setUserName(snapshot.child('firstname').val()+" "+snapshot.child('lastname').val());
						timer(2000).subscribe(() => this.showSplash = false);
					}
				})
			} else {
				this.authService.setIsUserLoggedIn(false);
				timer(2000).subscribe(() => this.showSplash = false);
			}
		  }, err => {
			  console.log('err', err);
		 })
	});

	let options: NativeGeocoderOptions = {
		useLocale: true,
		maxResults: 5
	};
	
	if(this.locationService.getLatitude() == undefined || this.locationService.getLatitude() == "" 
		|| this.locationService.getLongitude() == undefined || this.locationService.getLongitude() == ""
		|| this.locationService.getCurrentLocation() == undefined || this.locationService.getCurrentLocation() == "") {
		this.geolocation.getCurrentPosition().then((resp) => {
		 this.locationService.setLatitude(resp.coords.latitude.toString());
		 this.locationService.setLongitude(resp.coords.longitude.toString());
		 this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
			.then((result: NativeGeocoderResult[]) => {
				this.locationService.setCurrentLocation(this.generateAddress(result[0]));
			})
			.catch((error: any) => {
				//this.navController.navigateRoot('/locationfinder');
			});
		}).catch((error) => {
		  console.log('Error getting location', error);
		});
	}
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
  
  openAboutMe() {
	  this.menuCtrl.toggle();
	  this.navController.navigateRoot('/aboutme');
	}
	
	generateAddress(addressObj) {
		let obj = [];
		let address = "";
		for (let key in addressObj) {
		  obj.push(addressObj[key]);
		}
		obj.reverse();
		for (let val in obj) {
		  if (obj[val].length)
			address += obj[val] + ', ';
		}
		return address.slice(0, -2);
	  }
}
