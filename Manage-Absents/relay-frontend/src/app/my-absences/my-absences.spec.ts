import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MyAbsences } from './my-absences';

describe('MyAbsences', () => {
  let component: MyAbsences;
  let fixture: ComponentFixture<MyAbsences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAbsences, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MyAbsences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
