import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SellerproductsPage } from './sellerproducts.page';

describe('SellerproductsPage', () => {
  let component: SellerproductsPage;
  let fixture: ComponentFixture<SellerproductsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellerproductsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SellerproductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
