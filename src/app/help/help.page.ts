import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  constructor(private callNumber: CallNumber) { }

  ngOnInit() {
  }
  
  callforDetail(number) {
	  this.callNumber.callNumber(number, true)
	  .then(res => console.log('Launched dialer!', res))
	  .catch(err => console.log('Error launching dialer', err));
  }
}
