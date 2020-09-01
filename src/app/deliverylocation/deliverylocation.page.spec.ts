import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeliverylocationPage } from './deliverylocation.page';

describe('DeliverylocationPage', () => {
  let component: DeliverylocationPage;
  let fixture: ComponentFixture<DeliverylocationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverylocationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliverylocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
