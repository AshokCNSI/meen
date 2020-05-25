import { Component, OnInit, ViewChild  } from '@angular/core';
import * as firebase from 'firebase';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticateService } from '../authentication.service';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { NavController } from '@ionic/angular';

import { IonSlides } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
	
  public discountList = [];
  @ViewChild('mySlider') slider: IonSlides;
  userEmail : string;
  
  constructor(
  private activatedRoute: ActivatedRoute, 
  public fAuth: AngularFireAuth, 
  private authService: AuthenticateService,
  private db: AngularFireDatabase,
  private navController: NavController
  ) { }

  ngOnInit() {
	  let discountStocks = this.db.list('/stock', ref => ref.orderByChild('discount').equalTo("Y"));
	  discountStocks.snapshotChanges().subscribe(res => {
      this.discountList = [];
      res.forEach(item => {
        let a = item.payload.toJSON();
        a['$key'] = item.key;
		this.discountList.push(a);
      })
    });
  }

  onSlideChanged(e) {
    
  }

  onSlideChangeStart(event) {
    /** isEnd true when slides reach at end slide */
    event.target.isEnd().then(isEnd => {
      
    });
  }
  
  slidesDidLoad(slides: IonSlides) {
    slides.startAutoplay();
  }
  
  nagivateProdcut(index, productcode) {
	  this.navController.navigateRoot('/stockdetail', {queryParams : {index : index, productcode : productcode, status : 'R'}});
  }
}
