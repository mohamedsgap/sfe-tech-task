import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UsersFacadeService } from './users-facade.service';
import { UserStore } from '../stores/users.store';
import { UsersService } from '../services/users.service';
import { User } from '../../shared/models/user';

describe('UsersFacadeService', () => {
  let facade: UsersFacadeService;
  let storeSpy: jasmine.SpyObj<UserStore>;
  let serviceSpy: jasmine.SpyObj<UsersService>;

  const mockUsers: User[] = [
    { id: 1, username: 'user1', role: 'admin' },
    { id: 2, username: 'user2', role: 'user' }
  ];

  const mockUser: User = { id: 1, username: 'user1', role: 'admin' };
  const mockNewUser: Partial<User> = { username: 'newuser', role: 'user', password: 'password123' };
  const mockCreatedUser: User = { id: 3, username: 'newuser', role: 'user' };
  const mockUpdateUser: Partial<User> = { id: 1, username: 'updateduser', role: 'admin' };

  beforeEach(() => {
    const storeMock = jasmine.createSpyObj('UserStore', 
      ['setUsers', 'setUser', 'setLoading', 'setError', 'upsertUser'],
      {
        users: jasmine.createSpyObj('Signal', ['asReadonly']),
        user: jasmine.createSpyObj('Signal', ['asReadonly']),
        loading: jasmine.createSpyObj('Signal', ['asReadonly']),
        error: jasmine.createSpyObj('Signal', ['asReadonly'])
      }
    );
    
    const serviceMock = jasmine.createSpyObj('UsersService', 
      ['getUsers', 'getUserById', 'addUser', 'editUser']
    );

    TestBed.configureTestingModule({
      providers: [
        UsersFacadeService,
        { provide: UserStore, useValue: storeMock },
        { provide: UsersService, useValue: serviceMock }
      ]
    });

    facade = TestBed.inject(UsersFacadeService);
    storeSpy = TestBed.inject(UserStore) as jasmine.SpyObj<UserStore>;
    serviceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('loadUsers', () => {
    it('should set loading state and call service', () => {
      serviceSpy.getUsers.and.returnValue(of(mockUsers));
      
      facade.loadUsers();
      
      expect(storeSpy.setLoading).toHaveBeenCalledWith(true);
      expect(serviceSpy.getUsers).toHaveBeenCalled();
    });

    it('should update store with users on success', () => {
      serviceSpy.getUsers.and.returnValue(of(mockUsers));
      
      facade.loadUsers();
      
      expect(storeSpy.setUsers).toHaveBeenCalledWith(mockUsers);
      expect(storeSpy.setError).toHaveBeenCalledWith('');
      expect(storeSpy.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle errors', () => {
      const errorResponse = { error: { message: 'Failed to load users' } };
      serviceSpy.getUsers.and.returnValue(throwError(() => errorResponse));
      
      facade.loadUsers();
      
      expect(storeSpy.setError).toHaveBeenCalledWith('Failed to load users');
      expect(storeSpy.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('loadUser', () => {
    it('should set loading state and call service', () => {
      serviceSpy.getUserById.and.returnValue(of(mockUser));
      
      facade.loadUser(1);
      
      expect(storeSpy.setLoading).toHaveBeenCalledWith(true);
      expect(serviceSpy.getUserById).toHaveBeenCalledWith(1);
    });

    it('should update store with user on success', () => {
      serviceSpy.getUserById.and.returnValue(of(mockUser));
      
      facade.loadUser(1);
      
      expect(storeSpy.setUser).toHaveBeenCalledWith(mockUser);
      expect(storeSpy.setError).toHaveBeenCalledWith('');
      expect(storeSpy.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle errors', () => {
      const errorResponse = { error: { message: 'User not found' } };
      serviceSpy.getUserById.and.returnValue(throwError(() => errorResponse));
      
      facade.loadUser(999);
      
      expect(storeSpy.setError).toHaveBeenCalledWith('User not found');
      expect(storeSpy.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('saveUser', () => {
    it('should call addUser for new user', () => {
      serviceSpy.addUser.and.returnValue(of(mockCreatedUser));
      
      facade.saveUser(mockNewUser);
      
      expect(storeSpy.setLoading).toHaveBeenCalledWith(true);
      expect(serviceSpy.addUser).toHaveBeenCalledWith(mockNewUser);
      expect(serviceSpy.editUser).not.toHaveBeenCalled();
    });

    it('should call editUser for existing user', () => {
      serviceSpy.editUser.and.returnValue(of(mockUpdateUser as User));
      
      facade.saveUser(mockUpdateUser);
      
      expect(storeSpy.setLoading).toHaveBeenCalledWith(true);
      expect(serviceSpy.editUser).toHaveBeenCalledWith(mockUpdateUser);
      expect(serviceSpy.addUser).not.toHaveBeenCalled();
    });

    it('should update store on successful save', () => {
      serviceSpy.addUser.and.returnValue(of(mockCreatedUser));
      
      facade.saveUser(mockNewUser);
      
      expect(storeSpy.upsertUser).toHaveBeenCalledWith(mockCreatedUser);
      expect(storeSpy.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle errors', () => {
      const errorResponse = { error: { message: 'Failed to save user' } };
      serviceSpy.addUser.and.returnValue(throwError(() => errorResponse));
      
      facade.saveUser(mockNewUser);
      
      expect(storeSpy.setError).toHaveBeenCalledWith('Failed to save user');
      expect(storeSpy.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('clearUser', () => {
    it('should clear the current user', () => {
      facade.clearUser();
      expect(storeSpy.setUser).toHaveBeenCalledWith(null as any);
    });
  });
});
