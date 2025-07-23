import { TestBed } from '@angular/core/testing';
import { UserStore } from './users.store';
import { User } from '../../shared/models/user';

describe('UserStore', () => {
  let store: UserStore;

  const mockUsers: User[] = [
    { id: 1, username: 'user1', role: 'admin' },
    { id: 2, username: 'user2', role: 'user' }
  ];

  const mockUser: User = { id: 1, username: 'user1', role: 'admin' };
  const mockUpdatedUser: User = { id: 1, username: 'updateduser', role: 'admin' };
  const mockNewUser: User = { id: 3, username: 'newuser', role: 'user' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserStore]
    });
    store = TestBed.inject(UserStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('setUsers', () => {
    it('should update the users signal', () => {
      store.setUsers(mockUsers);
      expect(store.users()).toEqual(mockUsers);
    });
  });

  describe('setUser', () => {
    it('should update the user signal', () => {
      store.setUser(mockUser);
      expect(store.user()).toEqual(mockUser);
    });
  });

  describe('setLoading', () => {
    it('should update the loading signal', () => {
      store.setLoading(true);
      expect(store.loading()).toBeTrue();
      
      store.setLoading(false);
      expect(store.loading()).toBeFalse();
    });
  });

  describe('setError', () => {
    it('should update the error signal', () => {
      const errorMessage = 'Test error message';
      store.setError(errorMessage);
      expect(store.error()).toEqual(errorMessage);
      
      store.setError('');
      expect(store.error()).toEqual('');
    });
  });

  describe('upsertUser', () => {
    it('should add a new user when it does not exist', () => {
      // Setup initial users
      store.setUsers(mockUsers);
      
      // Add a new user
      store.upsertUser(mockNewUser);
      
      // Check that the new user was added
      const updatedUsers = store.users();
      expect(updatedUsers.length).toBe(3);
      expect(updatedUsers).toContain(mockNewUser);
    });

    it('should update an existing user', () => {
      // Setup initial users
      store.setUsers(mockUsers);
      
      // Update an existing user
      store.upsertUser(mockUpdatedUser);
      
      // Check that the user was updated
      const updatedUsers = store.users();
      expect(updatedUsers.length).toBe(2);
      
      const updatedUser = updatedUsers.find(u => u.id === mockUpdatedUser.id);
      expect(updatedUser).toEqual(mockUpdatedUser);
    });
  });
});