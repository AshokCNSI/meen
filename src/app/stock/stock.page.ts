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
@ViewChild('search') search : any;

categoryID : number;
fullStocks : AngularFireList<any>;
fullStocksCategory : AngularFireList<any>;
userEmail : string;
isAdmin : boolean = false;
searchInput : string;
searchVal : string;
  ngOnInit() {
	  this.activatedRoute.queryParams.subscribe(params => {
		  this.searchInput = params['search'];
		  this.searchVal = params['val'];
		  if(this.searchInput != null) {
			  firebase.database().ref('/stock').once('value').then((snapshot) => {
				  this.stockList = [];
				  snapshot.forEach(item => {
					this.stockList.push(item.toJSON());
				  })
				  this.search.setFocus();
			  });
		  }
		});
	  this.categoryID = this.activatedRoute.snapshot.params['id'];  
	  this.fullStocks = this.db.list('/stock', ref => ref.orderByChild('category'));
	  if(this.categoryID == 0 && this.searchInput == null) {
		 this.fullStocks = this.db.list('/stock', ref => ref.orderByChild('category'));
		 this.fullStocks.snapshotChanges().subscribe(res => {
		  this.stockList = [];
		  res.forEach(item => {
			let a = item.payload.toJSON();
			a['$key'] = item.key;
			this.stockList.push(a);
		  })
		});
	  } else if(this.searchInput == null){
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
	  
	if(this.authService.getUserType() == 'SA' || this.authService.getUserType() == 'A') {
		this.isAdmin = true;
	}
	  
  }
  
  routeStockDetail(index,productcode){
	  this.navController.navigateRoot('/stockdetail',{queryParams : {index : index, productcode : productcode, status : 'R'}});
  }
  
  filterList(event) {
	if(event.srcElement.value == null || event.srcElement.value == '') {
		this.fullStocks.snapshotChanges().subscribe(res => {
		  this.stockList = [];
		  res.forEach(item => {
			let a = item.payload.toJSON();
			a['$key'] = item.key;
			this.stockList.push(a);
		  })
		});
	} else {
	firebase.database().ref('/stock').orderByChild('title').startAt(event.srcElement.value).endAt(event.srcElement.value+"\uf8ff").once('value').then((snapshot) => {
		  this.stockList = [];
		  snapshot.forEach(item => {
			this.stockList.push(item.toJSON());
		  })
	  });
	}
  }
  
  onCancel(event) {
	this.navController.navigateRoot('/home');
  }
  
  openSearch() {
	  this.searchInput = " ";
  }

}
