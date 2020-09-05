import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { LoaderInterceptor } from './loading.interceptor';
import { LoadingService } from './loading.service';

//  firebase imports, remove what you don't require
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { Network } from '@ionic-native/network/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { ErrorhandlerService } from './errorhandler.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavParams } from '@ionic/angular';

// environment
import { environment } from '../environments/environment';
import { StarRatingModule } from 'ionic5-star-rating';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
	AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
	BrowserAnimationsModule,
	StarRatingModule
  ],
  providers: [
    StatusBar,
	Network,
	CallNumber,
    SplashScreen,
	Geolocation,
	NativeGeocoder,
	Diagnostic,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
	{ provide: ErrorHandler, useClass: ErrorhandlerService },
	LoadingService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
	NavParams
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
