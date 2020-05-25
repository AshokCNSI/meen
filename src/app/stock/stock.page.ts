import { Component, OnInit, ViewChild  } from '@angular/core';
import * as firebase from 'firebase';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticateService } from '../authentication.service';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit {
  public stockList = [];
  constructor(
  private activatedRoute: ActivatedRoute, 
  public fAuth: AngularFireAuth, 
  private authService: AuthenticateService,
  private db: AngularFireDatabase,
  private navController: NavController,
  private router : ActivatedRoute
  ) { }

categoryID : number;
fullStocks : AngularFireList<any>;
fullStocksCategory : AngularFireList<any>;
userEmail : string;
isAdmin : boolean = false;

  ngOnInit() {
	  this.categoryID = this.activatedRoute.snapshot.params['id'];  
	  this.fullStocks = this.db.list('/stock', ref => ref.orderByChild('category'));
	  if(this.categoryID == 0) {
		 this.fullStocks = this.db.list('/stock', ref => ref.orderByChild('category'));
		 this.fullStocks.snapshotChanges().subscribe(res => {
		  this.stockList = [];
		  res.forEach(item => {
			let a = item.payload.toJSON();
			a['$key'] = item.key;
			this.stockList.push(a);
		  })
		});
	  } else {
		 this.fullStocksCategory = this.db.list('/stock', ref => ref.orderByChild('category').equalTo(this.categoryID));
		 this.fullStocksCategory.snapshotChanges().subscribe(res => {
		  this.stockList = [];
		  res.forEach(item => {
			let a = item.payload.toJSON();
			a['$key'] = item.key;
			this.stockList.push(a);
		  })
		});
	  }
	  
	  this.authService.userDetails().subscribe(res => { 
		  if (res !== null) {
			this.userEmail = res.email;
			if(this.userEmail == 'admin@meen.org') {
				this.isAdmin = true;
			}
		  } else {
			
		  }
    }, err => {
      console.log('err', err);
    });
	  
  }
  
  routeStockDetail(index,productcode){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : 'R'}});
  }

}
