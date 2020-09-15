import { Component, OnInit, ViewChild } from '@angular/core';
import * as firebase from 'firebase';
import { PopoverController, ModalController, NavParams } from '@ionic/angular';
import { AuthenticateService } from '../authentication.service';

@Component({
  selector: 'app-ratingseller',
  templateUrl: './ratingseller.page.html',
  styleUrls: ['./ratingseller.page.scss'],
})
export class RatingsellerPage implements OnInit {
  @ViewChild('rating') rating : any;
  ratingCount : number = 5;
  orderid : string;
  sellerid : string;
  
  constructor(private authService: AuthenticateService,
  public modalController: ModalController,
  public popoverController: PopoverController,
  private navParams: NavParams
) { 
this.sellerid = this.navParams.data.sellerid;
this.orderid = this.navParams.data.orderid;
}

  ngOnInit() {
	  
  }
  
  logRatingChange(rating){
	 this.ratingCount = rating;
  }
  
  submitRating() {
	  firebase.database().ref('/rating/'+this.sellerid).push({
		"rating": this.ratingCount,
		"orderid" : this.orderid,
		"createddate":new Date().toLocaleString(),
		"createdby":this.authService.getUserID()
	  }).then(
	   res => 
	   {
		   this.popoverController.dismiss();
	   }
	 )
  }

}
