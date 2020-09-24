import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'stock/:id',
    loadChildren: () => import('./stock/stock.module').then( m => m.StockPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./notification/notification.module').then( m => m.NotificationPageModule)
  },
  {
    path: 'help',
    loadChildren: () => import('./help/help.module').then( m => m.HelpPageModule)
  },
  {
    path: 'stockdetail',
    loadChildren: () => import('./stockdetail/stockdetail.module').then( m => m.StockdetailPageModule)
  },
  {
    path: 'mycart',
    loadChildren: () => import('./mycart/mycart.module').then( m => m.MycartPageModule)
  },
  {
    path: 'network',
    loadChildren: () => import('./network/network.module').then( m => m.NetworkPageModule)
  },
  {
    path: 'locationmap',
    loadChildren: () => import('./locationmap/locationmap.module').then( m => m.LocationmapPageModule)
  },
  {
    path: 'locationfinder',
    loadChildren: () => import('./locationfinder/locationfinder.module').then( m => m.LocationfinderPageModule)
  },
  {
    path: 'myaddress',
    loadChildren: () => import('./myaddress/myaddress.module').then( m => m.MyaddressPageModule)
  },
  {
    path: 'addressbook',
    loadChildren: () => import('./addressbook/addressbook.module').then( m => m.AddressbookPageModule)
  },
  {
    path: 'queries',
    loadChildren: () => import('./queries/queries.module').then( m => m.QueriesPageModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./terms/terms.module').then( m => m.TermsPageModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./contact/contact.module').then( m => m.ContactPageModule)
  },
  {
    path: 'aboutme',
    loadChildren: () => import('./aboutme/aboutme.module').then( m => m.AboutmePageModule)
  },
  {
    path: 'notice',
    loadChildren: () => import('./notice/notice.module').then( m => m.NoticePageModule)
  },
  {
    path: 'locationsearch',
    loadChildren: () => import('./locationsearch/locationsearch.module').then( m => m.LocationsearchPageModule)
  },
  {
    path: 'locationassigner',
    loadChildren: () => import('./locationassigner/locationassigner.module').then( m => m.LocationassignerPageModule)
  },
  {
    path: 'addaddress',
    loadChildren: () => import('./addaddress/addaddress.module').then( m => m.AddaddressPageModule)
  },
  {
    path: 'sellerproducts/:selleruid',
    loadChildren: () => import('./sellerproducts/sellerproducts.module').then( m => m.SellerproductsPageModule)
  },
  {
    path: 'billingdetails',
    loadChildren: () => import('./billingdetails/billingdetails.module').then( m => m.BillingdetailsPageModule)
  },
  {
    path: 'orderdetails/:orderid',
    loadChildren: () => import('./orderdetails/orderdetails.module').then( m => m.OrderdetailsPageModule)
  },
  {
    path: 'ordersuccess/:orderid',
    loadChildren: () => import('./ordersuccess/ordersuccess.module').then( m => m.OrdersuccessPageModule)
  },
  {
    path: 'mapselection',
    loadChildren: () => import('./mapselection/mapselection.module').then( m => m.MapselectionPageModule)
  },
  {
    path: 'mobilelogin',
    loadChildren: () => import('./mobilelogin/mobilelogin.module').then( m => m.MobileloginPageModule)
  },
  {
    path: 'ratingseller',
    loadChildren: () => import('./ratingseller/ratingseller.module').then( m => m.RatingsellerPageModule)
  },
  {
    path: 'customerdetails',
    loadChildren: () => import('./customerdetails/customerdetails.module').then( m => m.CustomerdetailsPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
