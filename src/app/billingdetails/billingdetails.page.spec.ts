import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BillingdetailsPage } from './billingdetails.page';

describe('BillingdetailsPage', () => {
  let component: BillingdetailsPage;
  let fixture: ComponentFixture<BillingdetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingdetailsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingdetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
