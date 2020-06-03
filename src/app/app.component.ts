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
	private network: Network
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
	disconnectSubscription.unsubscribe();


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
	connectSubscription.unsubscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  
  ngOnInit() {
	
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      //this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
	let menuRes = this.db.list('/menu', ref => ref.orderByChild('order'));	
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
			}
		});
	  } else {
		 this.authService.setIsUserLoggedIn(false); 
	  }
	}, err => {
	  console.log('err', err);
	});
	
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
