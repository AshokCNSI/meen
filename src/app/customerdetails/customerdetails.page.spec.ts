import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomerdetailsPage } from './customerdetails.page';

describe('CustomerdetailsPage', () => {
  let component: CustomerdetailsPage;
  let fixture: ComponentFixture<CustomerdetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerdetailsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerdetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
