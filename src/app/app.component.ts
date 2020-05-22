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

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public commonMenus = [
	{
      title: 'Discounts',
      url: '/folder/Archived',
      icon: 'megaphone'
    },
    {
      title: 'Notification',
      url: '/folder/Trash',
      icon: 'notifications'
    },
    {
      title: 'Help',
      url: '/folder/Spam',
      icon: 'information'
    }
  ];
  public adminMenus = [
	{
      title: 'Profile',
      url: '/folder/Inbox',
      icon: 'people'
    },
    {
      title: 'Stock',
      url: '/folder/Inbox',
      icon: 'basket'
    },
    {
      title: 'Cutomers',
      url: '/folder/Outbox',
      icon: 'happy'
    },
    {
      title: 'Orders',
      url: '/folder/Favorites',
      icon: 'cart'
    }
  ];
  public customerMenus = [
	{
      title: 'My Profile',
      url: '/folder/Inbox',
      icon: 'people'
    },
    {
      title: 'My Orders',
      url: '/folder/Inbox',
      icon: 'basket'
    }
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  public menuList = [];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
	private authService: AuthenticateService,
	private navController: NavController, 
	private router: Router,
	private db: AngularFireDatabase
  ) {
    this.initializeApp();
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
	menuRes.snapshotChanges().subscribe(res => {
      this.menuList = [];
      res.forEach(item => {
        let a = item.payload.toJSON();
        a['$key'] = item.key;
		if(this.userEmail == null && a.type == 'C') {
			this.menuList.push(a);
		} else if(this.userEmail != null && this.userEmail == 'admin@meen.org' && (a.type == 'C' || a.type == 'A')) {
			this.menuList.push(a);
		} else if(this.userEmail != null && this.userEmail != 'admin@meen.org' && (a.type == 'C' || a.type == 'D')) {
			this.menuList.push(a);
		}
      })
    });
	
	this.authService.userDetails().subscribe(res => { 
      console.log('res', res);
      if (res !== null) {
        this.userEmail = res.email;
      } else {
       
      }
	  
	  menuRes.snapshotChanges().subscribe(res => {
		  this.menuList = [];
		  res.forEach(item => {
			let a = item.payload.toJSON();
			a['$key'] = item.key;
			if(this.userEmail == null && a.type == 'C') {
				this.menuList.push(a);
			} else if(this.userEmail != null && this.userEmail == 'admin@meen.org' && (a.type == 'C' || a.type == 'A')) {
				this.menuList.push(a);
			} else if(this.userEmail != null && this.userEmail != 'admin@meen.org' && (a.type == 'C' || a.type == 'D')) {
				this.menuList.push(a);
			}
		  })
		});
    }, err => {
      console.log('err', err);
    })
  }
  
  logout() {
	  this.authService.logoutUser()
      .then(res => {
        console.log(res);
		this.userEmail = null;
        this.navController.navigateBack('');
      })
      .catch(error => {
        console.log(error);
      })
  }
}
