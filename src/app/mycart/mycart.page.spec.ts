import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MycartPage } from './mycart.page';

describe('MycartPage', () => {
  let component: MycartPage;
  let fixture: ComponentFixture<MycartPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MycartPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MycartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
