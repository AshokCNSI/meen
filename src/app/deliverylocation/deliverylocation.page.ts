import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Location } from '@angular/common';
import { ModalController,NavParams } from '@ionic/angular';
import { LocationsearchPage } from '../locationsearch/locationsearch.page';
import { AuthenticateService } from '../authentication.service';
import { LocationserviceService } from '../locationservice.service';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import * as firebase from 'firebase';
import {  MenuController } from '@ionic/angular';

declare var google;

@Component({
  selector: 'app-deliverylocation',
  templateUrl: './deliverylocation.page.html',
  styleUrls: ['./deliverylocation.page.scss'],
})
export class DeliverylocationPage implements OnInit {
  
  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;
  address:string;
  addressA : string[];
  lat: string;
  long: string;  
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;
  current_location : string = "";
  current_lat : string = "";
  current_long : string = "";
  isHidden : boolean = false;
  name : string;
  mobile : string;
  houseno : string;
  streetname : string;
  landmark : string;
  latitude : string;
  longitude : string;
  customeraddress : string;

  constructor(
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,    
    public zone: NgZone,
	public locationR : Location,
	public modalController: ModalController,
	public alertCtrl: AlertController, 
	private navController: NavController, 
	private authService: AuthenticateService,
	private locationService: LocationserviceService,
	private menuCtrl : MenuController,
	private navParams  : NavParams 
  ) {
    
  }
 
  //LOAD THE MAP ONINIT.
  ngOnInit() {
	  this.loadMap();
  }

  //LOADING THE MAP HAS 2 PARTS.
  loadMap() {

    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
		panControl: false,
		zoomControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false,
		rotateControl: false,
		disableDefaultUI: true
      } 
      
      //LOAD THE MAP WITH THE PREVIOUS VALUES AS PARAMETERS.
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
	  this.direction(resp.coords.latitude,resp.coords.longitude,
			this.navParams.data.destinationlatitude,this.navParams.data.destinationlongitude);
      //this.addMarker(this.map);	  
      
    }).catch((error) => {
      
    });
  }
  
  direction(sourcelatitude,sourcelongitude,destinationlatitude,destinationlongitude) {
    
		let directionsService = new google.maps.DirectionsService;
        let directionsDisplay = new google.maps.DirectionsRenderer;

        directionsDisplay.setMap(this.map);

        directionsService.route({
            origin: {lat: Number(sourcelatitude), lng: Number(sourcelongitude)},
			destination: {lat: Number(destinationlatitude), lng: Number(destinationlongitude)},
            travelMode: 'DRIVING'
        }, (res, status) => {

            if(status == google.maps.DirectionsStatus.OK){
                directionsDisplay.setDirections(res);
			    var infowindow1 = new google.maps.InfoWindow();
			    infowindow1.setContent("You are here");
			    infowindow1.setPosition({lat: Number(sourcelatitude), lng: Number(sourcelongitude)});
			    infowindow1.open(this.map);
				
				var infowindow2 = new google.maps.InfoWindow();
			    infowindow2.setContent("Seller or Customer location is here");
			    infowindow2.setPosition({lat: Number(destinationlatitude), lng: Number(destinationlongitude)});
			    infowindow2.open(this.map);
            } else {
                console.warn(status);
            }

        });
  }
  
  goBack() {
	  this.modalController.dismiss();
  }
}
