import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddaddressPage } from './addaddress.page';

describe('AddaddressPage', () => {
  let component: AddaddressPage;
  let fixture: ComponentFixture<AddaddressPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddaddressPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddaddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
