import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyaddressPage } from './myaddress.page';

describe('MyaddressPage', () => {
  let component: MyaddressPage;
  let fixture: ComponentFixture<MyaddressPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyaddressPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyaddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
