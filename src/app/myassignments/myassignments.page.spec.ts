import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyassignmentsPage } from './myassignments.page';

describe('MyassignmentsPage', () => {
  let component: MyassignmentsPage;
  let fixture: ComponentFixture<MyassignmentsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyassignmentsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyassignmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
