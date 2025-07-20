import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { User } from '../../../shared/models/user';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  users = input<User[]>();

  edit: OutputEmitterRef<number> = output();
}
