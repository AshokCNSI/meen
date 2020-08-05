import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LocationmapPage } from './locationmap.page';

describe('LocationmapPage', () => {
  let component: LocationmapPage;
  let fixture: ComponentFixture<LocationmapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationmapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationmapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
