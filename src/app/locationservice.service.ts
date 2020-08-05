import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationserviceService {

  constructor() { }
  
  latitude : string;
  longitude : string;
  currentLocation : string;
  
  setLatitude(value : string) {
	  this.latitude = value;
  }
  
  getLatitude() {
	  return this.latitude;
  }
  
  setLongitude(value : string) {
	  this.longitude = value;
  }
  
  getLongitude() {
	  return this.longitude;
  }
  
  setCurrentLocation(value : string) {
	  this.currentLocation = value;
  }
  
  getCurrentLocation() {
	  return this.currentLocation;
  }
}
