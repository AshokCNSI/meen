import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LocationassignerPage } from './locationassigner.page';

describe('LocationassignerPage', () => {
  let component: LocationassignerPage;
  let fixture: ComponentFixture<LocationassignerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationassignerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationassignerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
