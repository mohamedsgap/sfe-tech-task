import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { UserFormComponent } from '../user-form/user-form.component';
import { User } from '../../../shared/models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersFacadeService } from '../../../core/facades/users-facade.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-form-page',
  imports: [
    CommonModule,
    UserFormComponent,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './user-form-page.component.html',
  styleUrl: './user-form-page.component.scss'
})
export class UserFormPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private facade = inject(UsersFacadeService);

  user = this.facade.user;
  loading = this.facade.loading;
  error = this.facade.error;

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      // The backend compares the ID directly with === without type conversion
      // We need to ensure the ID is in the correct format for the backend comparison
      this.facade.loadUser(Number(userId));
    } else {
      // Clear any existing user data when creating a new user
      this.facade.clearUser();
    }
  }

  ngOnDestroy(): void {
    // Clear user data when leaving the form
    this.facade.clearUser();
  }

  handleSave(user: Partial<User>) {
    // Save the user
    this.facade.saveUser(user);
    
    // We'll use a timeout to check for errors after the save operation completes
    // This gives the facade time to process the response and update the error state
    setTimeout(() => {
      // Only navigate back if there's no error
      if (!this.error()) {
        this.goBack();
      }
    }, 300); // Short delay to allow the save operation to complete
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
