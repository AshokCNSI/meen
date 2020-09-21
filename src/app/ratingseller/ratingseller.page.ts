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
		   firebase.database().ref('/rating/'+this.sellerid).once('value').then((snapshot) => {
			if(snapshot != null) {
				let R1  = 0;
				let R2  = 0;
				let R3  = 0;
				let R4  = 0;
				let R5  = 0;
				snapshot.forEach(item => {
					let b = item.toJSON();
					if(b['rating'] == 5) {
						R5 = R5 + 1;
					} else if(b['rating'] == 4) {
						R4 = R4 + 1;
					} else if(b['rating'] == 3) {
						R3 = R3 + 1;
					} else if(b['rating'] == 2) {
						R2 = R2 + 1;
					} else if(b['rating'] == 1) {
						R1 = R1 + 1;
					}
					
				})
				let rating = (5 * R5 + 4 * R4 + 3 * R3 + 2 * R2 + 1 * R1)/(R5 + R4 + R3 + R2 + R1);
				if(!rating) {
					rating = 0;
				}
				
				firebase.database().ref('/profile/'+this.sellerid).update({
				   rating: Math.floor(Math.round(rating * 100) / 100),
				   "modifieddate": Date(),
				   "modifiedby":this.authService.getUserID()
			  }).then(
			   res => 
			   {
				   this.popoverController.dismiss();
			   }
			 ).catch(error => {
				
			  });	
			}
		}).catch((error: any) => {
			
		});
	   }
	 )
  }

}
