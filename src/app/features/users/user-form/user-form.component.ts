import { Component, inject, input, OnChanges, output, OutputEmitterRef } from '@angular/core';
import { User } from '../../../shared/models/user';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

// Custom validator to prevent usernames containing "test"
function noTestValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && typeof value === 'string' && value.toLowerCase().includes('test')) {
    return { containsTest: true };
  }
  return null;
}

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatError
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnChanges {
  user = input<User | null>();

  save: OutputEmitterRef<Partial<User>> = output();
  cancel: OutputEmitterRef<void> = output();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    username: ['', [Validators.required, noTestValidator]],
    role: ['', Validators.required],
    password: ['']
  });

  ngOnChanges(): void {
    // Initialize form with user data when user input changes
    const user = this.user();
    
    // Update password validator based on whether we're editing or creating
    const passwordControl = this.form.get('password');
    if (user?.id) {
      // Editing existing user - password is optional
      passwordControl?.clearValidators();
    } else {
      // Creating new user - password is required
      passwordControl?.setValidators(Validators.required);
    }
    passwordControl?.updateValueAndValidity();
    
    if (user) {
      this.form.patchValue({
        username: user.username,
        role: user.role,
        // Don't patch password as it's not returned from the API
      });
    }
  }

  submit(): void {
    if (this.form.valid) {
      const userData = { 
        ...this.user(), 
        ...this.form.value 
      };
      this.save.emit(userData as Partial<User>);
    }
  }

  // Helper methods for template
  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorName) || false;
  }
}
