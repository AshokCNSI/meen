import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DiscountsPage } from './discounts.page';

describe('DiscountsPage', () => {
  let component: DiscountsPage;
  let fixture: ComponentFixture<DiscountsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
