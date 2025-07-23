import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UsersListPageComponent } from './users-list-page.component';
import { UsersFacadeService } from '../../../core/facades/users-facade.service';
import { UsersListComponent } from '../users-list/users-list.component';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { User } from '../../../shared/models/user';
import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Mock UsersFacadeService with signals
class MockUsersFacadeService {
  private _users = signal<User[]>([
    { id: 1, username: 'user1', role: 'admin' },
    { id: 2, username: 'user2', role: 'user' }
  ]);
  private _loading = signal<boolean>(false);
  private _error = signal<string>('');

  users = this._users.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  loadUsers = jasmine.createSpy('loadUsers');
}

// Mock UsersListComponent
@Component({
  selector: 'app-users-list',
  template: '<div>Mock Users List</div>',
  standalone: true
})
class MockUsersListComponent {
  users: any;
  edit = jasmine.createSpy('edit');
}

describe('UsersListPageComponent', () => {
  let component: UsersListPageComponent;
  let fixture: ComponentFixture<UsersListPageComponent>;
  let mockFacade: MockUsersFacadeService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockFacade = new MockUsersFacadeService();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        UsersListPageComponent,
        MockUsersListComponent
      ],
      providers: [
        { provide: UsersFacadeService, useValue: mockFacade },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .overrideComponent(UsersListPageComponent, {
      remove: { imports: [UsersListComponent, MatButton] },
      add: { 
        imports: [MockUsersListComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersListPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load users on initialization', () => {
      fixture.detectChanges(); // Triggers ngOnInit
      
      expect(mockFacade.loadUsers).toHaveBeenCalled();
    });
  });

  describe('loadUsers', () => {
    it('should call facade loadUsers method', () => {
      component.loadUsers();
      
      expect(mockFacade.loadUsers).toHaveBeenCalled();
    });
  });

  describe('goToNew', () => {
    it('should navigate to user creation page', () => {
      component.goToNew();
      
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/users/create']);
    });
  });

  describe('goToEdit', () => {
    it('should navigate to user edit page with correct ID', () => {
      const userId = 1;
      
      component.goToEdit(userId);
      
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/users', userId]);
    });
  });
});
