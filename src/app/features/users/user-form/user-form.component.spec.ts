import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UserFormComponent } from './user-form.component';
import { User } from '../../../shared/models/user';
import { Component } from '@angular/core';

// Create a test host component to properly set inputs
@Component({
  template: `<app-user-form [user]="user" (save)="onSave($event)" (cancel)="onCancel()"></app-user-form>`,
  standalone: true,
  imports: [UserFormComponent]
})
class TestHostComponent {
  user: User | null = null;
  onSave(user: Partial<User>) {}
  onCancel() {}
}

describe('UserFormComponent', () => {
  let hostComponent: TestHostComponent;
  let component: UserFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockUser: User = {
    id: 1,
    username: 'user1',
    role: 'admin'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        UserFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
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
      
      usernameControl?.setValue('validuser');
      expect(usernameControl?.valid).toBeTruthy();
    });

    it('should validate role as required', () => {
      const roleControl = component.form.get('role');
      expect(roleControl?.valid).toBeFalsy();
      expect(roleControl?.errors?.['required']).toBeTruthy();
      
      roleControl?.setValue('admin');
      expect(roleControl?.valid).toBeTruthy();
    });

    it('should validate password as required for new users', () => {
      // By default, component is in "create" mode
      const passwordControl = component.form.get('password');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.errors?.['required']).toBeTruthy();
      
      passwordControl?.setValue('password123');
      expect(passwordControl?.valid).toBeTruthy();
    });

    it('should not validate password as required for existing users', () => {
      // Set an existing user to trigger edit mode
      hostComponent.user = mockUser;
      fixture.detectChanges();
      
      const passwordControl = component.form.get('password');
      expect(passwordControl?.hasValidator).toBeTruthy();
      expect(passwordControl?.errors).toBeNull();
    });

    it('should reject usernames containing "test"', () => {
      const usernameControl = component.form.get('username');
      
      usernameControl?.setValue('testuser');
      expect(usernameControl?.valid).toBeFalsy();
      expect(usernameControl?.errors?.['containsTest']).toBeTruthy();
      
      usernameControl?.setValue('validuser');
      expect(usernameControl?.valid).toBeTruthy();
    });

    it('should have valid form when all required fields are filled correctly', () => {
      component.form.setValue({
        username: 'validuser',
        role: 'admin',
        password: 'password123'
      });
      
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('ngOnChanges', () => {
    it('should patch form values when user input changes', () => {
      hostComponent.user = mockUser;
      fixture.detectChanges();
      
      expect(component.form.get('username')?.value).toBe(mockUser.username);
      expect(component.form.get('role')?.value).toBe(mockUser.role);
      // Password should not be patched
      expect(component.form.get('password')?.value).toBe('');
    });
  });

  describe('submit', () => {
    it('should not emit save event if form is invalid', () => {
      const saveSpy = spyOn(component.save, 'emit');
      
      component.submit();
      
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should emit save event with form values if form is valid', () => {
      const saveSpy = spyOn(component.save, 'emit');
      
      component.form.setValue({
        username: 'validuser',
        role: 'admin',
        password: 'password123'
      });
      
      component.submit();
      
      expect(saveSpy).toHaveBeenCalledWith({
        username: 'validuser',
        role: 'admin',
        password: 'password123'
      });
    });

    it('should merge existing user data with form values when saving', () => {
      const saveSpy = spyOn(component.save, 'emit');
      
      hostComponent.user = mockUser;
      fixture.detectChanges();
      
      component.form.patchValue({
        username: 'updateduser',
        role: 'user'
      });
      
      component.submit();
      
      expect(saveSpy).toHaveBeenCalledWith({
        id: 1,
        username: 'updateduser',
        role: 'user',
        password: ''
      });
    });
  });

  describe('hasError', () => {
    it('should return true when control has the specified error', () => {
      const usernameControl = component.form.get('username');
      usernameControl?.setValue('testuser');
      usernameControl?.markAsTouched();
      
      expect(component.hasError('username', 'containsTest')).toBeTrue();
    });

    it('should return false when control does not have the specified error', () => {
      const usernameControl = component.form.get('username');
      usernameControl?.setValue('validuser');
      usernameControl?.markAsTouched();
      
      expect(component.hasError('username', 'containsTest')).toBeFalse();
    });

    it('should return false when control is not touched', () => {
      const usernameControl = component.form.get('username');
      usernameControl?.setValue('testuser');
      
      expect(component.hasError('username', 'containsTest')).toBeFalse();
    });
  });
});
