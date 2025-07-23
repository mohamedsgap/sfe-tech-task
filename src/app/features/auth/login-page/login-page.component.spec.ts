import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../../../core/services/auth.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCard } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginPageComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormField,
        MatInput,
        MatLabel,
        MatCard,
        MatButton,
        MatIconButton,
        MatProgressSpinner,
        MatError,
        MatIcon,
        MatSuffix,
        MatCheckbox,
        MatTooltip
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routeSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should have invalid form when empty', () => {
      expect(component.form.valid).toBeFalsy();
    });

    it('should validate username as required', () => {
      const usernameControl = component.form.get('username');
      expect(usernameControl?.valid).toBeFalsy();
      expect(usernameControl?.errors?.['required']).toBeTruthy();
      
      usernameControl?.setValue('testuser');
      expect(usernameControl?.valid).toBeTruthy();
    });

    it('should validate password as required', () => {
      const passwordControl = component.form.get('password');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.errors?.['required']).toBeTruthy();
      
      passwordControl?.setValue('password123');
      expect(passwordControl?.valid).toBeTruthy();
    });

    it('should have valid form when all required fields are filled', () => {
      component.form.setValue({
        username: 'testuser',
        password: 'password123',
        rememberMe: false
      });
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('submit', () => {
    it('should not call login service if form is invalid', () => {
      component.submit();
      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should call login service with form values if form is valid', () => {
      const username = 'testuser';
      const password = 'password123';
      
      component.form.setValue({ username, password, rememberMe: false });
      authServiceSpy.login.and.returnValue(of({ token: 'token', user: { id: 1, username, role: 'admin' } }));
      
      component.submit();
      
      expect(authServiceSpy.login).toHaveBeenCalledWith(username, password);
    });

    it('should set loading state during login', () => {
      component.form.setValue({
        username: 'testuser',
        password: 'password123',
        rememberMe: false
      });
      
      authServiceSpy.login.and.returnValue(of({ token: 'token', user: { id: 1, username: 'testuser', role: 'admin' } }));
      
      component.submit();
      
      expect(component.loading()).toBeFalse(); // Should be reset after successful login
    });

    it('should navigate to users page on successful login', () => {
      component.form.setValue({
        username: 'testuser',
        password: 'password123',
        rememberMe: false
      });
      
      authServiceSpy.login.and.returnValue(of({ token: 'token', user: { id: 1, username: 'testuser', role: 'admin' } }));
      
      component.submit();
      
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
    });

    it('should handle login error', () => {
      component.form.setValue({
        username: 'testuser',
        password: 'wrongpassword',
        rememberMe: false
      });
      
      const errorResponse = { error: { message: 'Invalid credentials' } };
      authServiceSpy.login.and.returnValue(throwError(() => errorResponse));
      
      component.submit();
      
      expect(component.error()).toBe('Invalid credentials');
      expect(component.loading()).toBeFalse();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should handle login error with default message when no error message is provided', () => {
      component.form.setValue({
        username: 'testuser',
        password: 'wrongpassword',
        rememberMe: false
      });
      
      authServiceSpy.login.and.returnValue(throwError(() => ({})));
      
      component.submit();
      
      expect(component.error()).toBe('Login failed. Please try again.');
      expect(component.loading()).toBeFalse();
    });
  });

  describe('additional functionality', () => {
    it('should clear error message when clearError is called', () => {
      component.error.set('Test error');
      component.clearError();
      expect(component.error()).toBe('');
    });

    it('should toggle password visibility', () => {
      expect(component.hidePassword).toBeTrue();
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeFalse();
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeTrue();
    });

    it('should fill form with admin demo credentials', () => {
      component.fillDemoCredentials('admin');
      expect(component.form.get('username')?.value).toBe('admin');
      expect(component.form.get('password')?.value).toBe('admin');
    });

    it('should fill form with user demo credentials', () => {
      component.fillDemoCredentials('user');
      expect(component.form.get('username')?.value).toBe('user');
      expect(component.form.get('password')?.value).toBe('user');
    });
  });
});
