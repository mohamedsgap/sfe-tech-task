import { Component, inject, input, OnChanges, output, OutputEmitterRef } from '@angular/core';
import { User } from '../../../shared/models/user';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

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
    MatButtonModule
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
    const user = this.user();
    
    const passwordControl = this.form.get('password');
    if (user?.id) {
      passwordControl?.clearValidators();
    } else {
      passwordControl?.setValidators(Validators.required);
    }
    passwordControl?.updateValueAndValidity();
    
    if (user) {
      this.form.patchValue({
        username: user.username,
        role: user.role,
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

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorName) || false;
  }
}
