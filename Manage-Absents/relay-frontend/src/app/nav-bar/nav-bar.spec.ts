import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavBar } from './nav-bar';
import { AuthService } from '../auth-service';

describe('NavBar', () => {
  let component: NavBar;
  let fixture: ComponentFixture<NavBar>;
  const authServiceStub = {
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
    logout: jasmine.createSpy('logout'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBar, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout when the button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    button.click();
    expect(authServiceStub.logout).toHaveBeenCalled();
  });
});
