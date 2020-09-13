import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileloginPage } from './mobilelogin.page';

describe('MobileloginPage', () => {
  let component: MobileloginPage;
  let fixture: ComponentFixture<MobileloginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileloginPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileloginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
