import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TrackmyorderPage } from './trackmyorder.page';

describe('TrackmyorderPage', () => {
  let component: TrackmyorderPage;
  let fixture: ComponentFixture<TrackmyorderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackmyorderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackmyorderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
