import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UsersListComponent } from './users-list.component';
import { User } from '../../../shared/models/user';
import { Component, signal } from '@angular/core';

@Component({
  template: `<app-users-list [users]="users" (edit)="onEdit($event)"></app-users-list>`,
  standalone: true,
  imports: [UsersListComponent]
})
class TestHostComponent {
  users: User[] = [];
  onEdit(id: number) {}
}

describe('UsersListComponent', () => {
  let hostComponent: TestHostComponent;
  let component: UsersListComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockUsers: User[] = [
    { id: 1, username: 'user1', role: 'admin' },
    { id: 2, username: 'user2', role: 'user' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatButtonModule,
        UsersListComponent,
        TestHostComponent
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(UsersListComponent)).componentInstance;
    
    // Set the users in the host component
    hostComponent.users = mockUsers;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
