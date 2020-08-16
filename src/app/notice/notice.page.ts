import { Component, OnInit } from '@angular/core';
import { NavParams  } from '@ionic/angular';

@Component({
  selector: 'app-notice',
  templateUrl: './notice.page.html',
  styleUrls: ['./notice.page.scss'],
})
export class NoticePage implements OnInit {
   
   title : string;
   message :  string;
   
  constructor(public navParams:NavParams) {
   this.title = this.navParams.get('title');
   this.message = this.navParams.get('desc');
  }

  ngOnInit() {
  }

}
