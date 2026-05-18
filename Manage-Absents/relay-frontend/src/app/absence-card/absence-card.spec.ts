import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceCard } from './absence-card';

describe('AbsenceCard', () => {
  let component: AbsenceCard;
  let fixture: ComponentFixture<AbsenceCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsenceCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AbsenceCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
