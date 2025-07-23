import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { UserFormPageComponent } from './user-form-page.component';
import { UsersFacadeService } from '../../../core/facades/users-facade.service';
import { UserFormComponent } from '../user-form/user-form.component';
import { CommonModule } from '@angular/common';
import { User } from '../../../shared/models/user';
import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Mock UsersFacadeService with signals
class MockUsersFacadeService {
  private _user = signal<User | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string>('');

  user = this._user.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  loadUser = jasmine.createSpy('loadUser').and.callFake((id: number) => {
    this._user.set({ id, username: 'user1', role: 'admin' });
  });

  saveUser = jasmine.createSpy('saveUser');
  clearUser = jasmine.createSpy('clearUser').and.callFake(() => {
    this._user.set(null);
  });

  // Helper methods for tests
  setError(error: string) {
    this._error.set(error);
  }
}

// Mock UserFormComponent
@Component({
  selector: 'app-user-form',
  template: '<div>Mock User Form</div>',
  standalone: true
})
class MockUserFormComponent {
  user: any;
  save = jasmine.createSpy('save');
  cancel = jasmine.createSpy('cancel');
}

describe('UserFormPageComponent', () => {
  let component: UserFormPageComponent;
  let fixture: ComponentFixture<UserFormPageComponent>;
  let mockFacade: MockUsersFacadeService;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: any;

  const mockUser: User = { id: 1, username: 'user1', role: 'admin' };
  const mockNewUser: Partial<User> = { username: 'newuser', role: 'user', password: 'password123' };

  beforeEach(async () => {
    mockFacade = new MockUsersFacadeService();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({})
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        UserFormPageComponent,
        MockUserFormComponent
      ],
      providers: [
        { provide: UsersFacadeService, useValue: mockFacade },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
    .overrideComponent(UserFormPageComponent, {
      remove: { imports: [UserFormComponent] },
      add: { 
        imports: [MockUserFormComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserFormPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load user when ID is provided', () => {
      // Setup route with user ID
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: '1' });
      
      fixture.detectChanges(); // Triggers ngOnInit
      
      expect(mockFacade.loadUser).toHaveBeenCalledWith(1);
      expect(mockFacade.clearUser).not.toHaveBeenCalled();
    });

    it('should clear user when no ID is provided (create mode)', () => {
      // Route without user ID
      activatedRouteMock.snapshot.paramMap = convertToParamMap({});
      
      fixture.detectChanges(); // Triggers ngOnInit
      
      expect(mockFacade.loadUser).not.toHaveBeenCalled();
      expect(mockFacade.clearUser).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should clear user data', () => {
      fixture.detectChanges();
      component.ngOnDestroy();
      
      expect(mockFacade.clearUser).toHaveBeenCalled();
    });
  });

  describe('handleSave', () => {
    it('should call saveUser with provided user data', () => {
      fixture.detectChanges();
      
      component.handleSave(mockNewUser);
      
      expect(mockFacade.saveUser).toHaveBeenCalledWith(mockNewUser);
    });

    it('should navigate back to users list after successful save', fakeAsync(() => {
      fixture.detectChanges();
      component.handleSave(mockNewUser);
      
      tick(300); // Wait for the timeout in the component
      
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
    }));

    it('should not navigate if there is an error', fakeAsync(() => {
      mockFacade.setError('Error saving user');
      
      fixture.detectChanges();
      component.handleSave(mockNewUser);
      
      tick(300); // Wait for the timeout in the component
      
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('goBack', () => {
    it('should navigate to users list', () => {
      fixture.detectChanges();
      
      component.goBack();
      
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
    });
  });
});
