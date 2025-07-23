import { Component, inject, signal, WritableSignal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  error: WritableSignal<string> = signal('');
  loading: WritableSignal<boolean> = signal(false);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.valid) {
      const { username, password } = this.form.value;
      
      this.loading.set(true);
      this.error.set('');
      
      this.authService.login(username!, password!).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Login failed. Please try again.');
        }
      });
    }
  }
}
