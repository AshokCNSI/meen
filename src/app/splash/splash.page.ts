import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {

  constructor(public modalController: ModalController, public splashScreen: SplashScreen) {

  }

  ionViewDidEnter() {
    this.splashScreen.hide();

    setTimeout(() => {
      this.modalController.dismiss();
    }, 4000);

  }

}
