import { Component, OnInit, ViewChild  } from '@angular/core';
import * as firebase from 'firebase';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticateService } from '../authentication.service';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  userEmail: string;
  @ViewChild('mySlider') slider: IonSlides;
  constructor(private activatedRoute: ActivatedRoute, public fAuth: AngularFireAuth, private authService: AuthenticateService) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
	this.authService.userDetails().subscribe(res => {
      console.log('res', res);
      if (res !== null) {
        this.userEmail = res.email;
      } else {
       
      }
    }, err => {
      console.log('err', err);
    })
  }
  
  onSlideChanged(e) {
    console.log('On slide change event');
  }

  onSlideChangeStart(event) {
    /** isEnd true when slides reach at end slide */
    event.target.isEnd().then(isEnd => {
      console.log('End of slide', isEnd);
    });
  }
  
  slidesDidLoad(slides: IonSlides) {
    slides.startAutoplay();
  }
}
