import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceDetailModal } from './absence-detail-modal';

describe('AbsenceDetailModal', () => {
  let component: AbsenceDetailModal;
  let fixture: ComponentFixture<AbsenceDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsenceDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AbsenceDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
