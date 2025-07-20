import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { UserFormComponent } from '../user-form/user-form.component';
import { User } from '../../../shared/models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersFacadeService } from '../../../core/facades/users-facade.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form-page',
  imports: [
    CommonModule,
    UserFormComponent
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
      this.facade.loadUser(+userId);
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
    this.facade.saveUser(user);
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
